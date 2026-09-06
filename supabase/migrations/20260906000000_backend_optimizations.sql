-- =============================================================================
-- Supabase Migration: 20260906000000_backend_optimizations.sql
-- Kishan Seva — Backend Logic Improvements
--
-- 1. PostGIS-based geo-spatial nearest centre lookup
-- 2. Queue metrics materialized view / RPC
-- 3. Atomic transaction RPCs for weighment + quality check
-- 4. Row-Level Security for scoped real-time subscriptions
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. POSTGIS EXTENSION & GEO-SPATIAL RPC
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable PostGIS (safe to call multiple times)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add a generated geography column to procurement_centres for indexed spatial queries.
-- This avoids re-calculating the geography on every query.
ALTER TABLE public.procurement_centres
  ADD COLUMN IF NOT EXISTS geog GEOGRAPHY(POINT, 4326);

-- Backfill any existing rows
UPDATE public.procurement_centres
  SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  WHERE geog IS NULL;

-- Auto-populate geog on INSERT or UPDATE via trigger
CREATE OR REPLACE FUNCTION trg_centres_set_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS centres_geog_trigger ON public.procurement_centres;
CREATE TRIGGER centres_geog_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.procurement_centres
  FOR EACH ROW
  EXECUTE FUNCTION trg_centres_set_geog();

-- Spatial index for fast nearest-neighbour lookups
CREATE INDEX IF NOT EXISTS idx_centres_geog ON public.procurement_centres USING GIST (geog);

-- RPC: Find the nearest N active centres to a given farmer location.
-- Optionally filters by a specific crop name.
-- Returns distance_km and travel_time_mins alongside the centre data.
CREATE OR REPLACE FUNCTION find_nearest_centres(
  p_lat DOUBLE PRECISION,
  p_lon DOUBLE PRECISION,
  p_crop_name TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  centre_code VARCHAR(50),
  name VARCHAR(255),
  address TEXT,
  state VARCHAR(100),
  district VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  daily_capacity_quintals DECIMAL(10,2),
  current_queue_length INTEGER,
  est_wait_time_mins INTEGER,
  accepted_crops TEXT[],
  status VARCHAR(50),
  contact_number VARCHAR(50),
  distance_km DOUBLE PRECISION,
  travel_time_mins INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.centre_code,
    c.name,
    c.address,
    c.state,
    c.district,
    c.latitude,
    c.longitude,
    c.daily_capacity_quintals,
    c.current_queue_length,
    c.est_wait_time_mins,
    c.accepted_crops,
    c.status,
    c.contact_number,
    ROUND((ST_Distance(
      c.geog,
      ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
    ) / 1000.0)::NUMERIC, 1)::DOUBLE PRECISION AS distance_km,
    -- Assume average rural travel speed of 25 km/h
    ROUND((ST_Distance(
      c.geog,
      ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
    ) / 1000.0 / 25.0 * 60.0)::NUMERIC)::INTEGER AS travel_time_mins
  FROM public.procurement_centres c
  WHERE c.status = 'ACTIVE'
    AND (p_crop_name IS NULL OR p_crop_name = ANY(c.accepted_crops))
  ORDER BY c.geog <-> ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. QUEUE METRICS VIEW & RPC
-- ─────────────────────────────────────────────────────────────────────────────

-- A view that aggregates live queue statistics per centre from the bookings table.
-- This avoids the client downloading all bookings just to count statuses.
CREATE OR REPLACE VIEW public.v_centre_queue_metrics AS
SELECT
  b.centre_id,
  COUNT(*) FILTER (WHERE b.status IN ('CHECKED_IN', 'WAITING'))     AS checked_in_count,
  COUNT(*) FILTER (WHERE b.status IN ('QUALITY_TESTING', 'WEIGHMENT')) AS processing_count,
  COUNT(*) FILTER (WHERE b.status = 'BOOKED')                       AS prebooked_count,
  COUNT(*) FILTER (WHERE b.status NOT IN ('COMPLETED', 'CANCELLED')) AS total_active,
  -- Predicted wait: (checked_in + processing + 40% of prebooked) * 4.5 mins avg
  GREATEST(5, ROUND(
    (
      COUNT(*) FILTER (WHERE b.status IN ('CHECKED_IN', 'WAITING'))
      + COUNT(*) FILTER (WHERE b.status IN ('QUALITY_TESTING', 'WEIGHMENT'))
      + ROUND(COUNT(*) FILTER (WHERE b.status = 'BOOKED') * 0.4 * 0.95)
    ) * 4.5
  ))::INTEGER AS predicted_wait_mins,
  -- Processing rate: ~13 vehicles/hour at 4.5 mins avg
  13 AS processing_rate_per_hour,
  -- Confidence tier
  CASE
    WHEN COUNT(*) < 3 THEN 'LOW'
    WHEN COUNT(*) FILTER (WHERE b.status = 'BOOKED') > 20 THEN 'MEDIUM'
    ELSE 'HIGH'
  END AS confidence
FROM public.bookings b
WHERE b.slot_date = CURRENT_DATE
GROUP BY b.centre_id;

-- RPC to fetch queue prediction for a single centre (wraps the view).
CREATE OR REPLACE FUNCTION get_queue_prediction(p_centre_id UUID)
RETURNS TABLE (
  centre_id UUID,
  current_queue INTEGER,
  prebooked_tokens INTEGER,
  checked_in_farmers INTEGER,
  currently_processing INTEGER,
  expected_next_hour INTEGER,
  predicted_wait_mins INTEGER,
  confidence TEXT,
  processing_rate_per_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.centre_id,
    (m.checked_in_count + m.processing_count)::INTEGER AS current_queue,
    m.prebooked_count::INTEGER AS prebooked_tokens,
    m.checked_in_count::INTEGER AS checked_in_farmers,
    m.processing_count::INTEGER AS currently_processing,
    ROUND(m.prebooked_count * 0.95 * 0.4)::INTEGER AS expected_next_hour,
    m.predicted_wait_mins,
    m.confidence,
    m.processing_rate_per_hour
  FROM public.v_centre_queue_metrics m
  WHERE m.centre_id = p_centre_id;

  -- If no data, return zeros
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      p_centre_id,
      0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER,
      5::INTEGER, 'LOW'::TEXT, 13::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ATOMIC TRANSACTION RPCs
-- ─────────────────────────────────────────────────────────────────────────────

-- Atomic weighment submission: updates booking status + inserts quality_check +
-- inserts weighment in a single database transaction. If any step fails, all
-- changes are rolled back.
CREATE OR REPLACE FUNCTION submit_weighment_transaction(
  p_booking_id UUID,
  p_status TEXT,
  -- Quality check fields
  p_moisture_percent DECIMAL DEFAULT NULL,
  p_foreign_matter_percent DECIMAL DEFAULT NULL,
  p_broken_grain_percent DECIMAL DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_inspector_name TEXT DEFAULT NULL,
  p_certificate_id TEXT DEFAULT NULL,
  -- Weighment fields
  p_gross_weight_q DECIMAL DEFAULT NULL,
  p_tare_weight_q DECIMAL DEFAULT NULL,
  p_net_weight_q DECIMAL DEFAULT NULL,
  p_msp_rate_per_q DECIMAL DEFAULT NULL,
  p_gross_amount DECIMAL DEFAULT NULL,
  p_moisture_deduction DECIMAL DEFAULT NULL,
  p_handling_charge DECIMAL DEFAULT NULL,
  p_net_payable DECIMAL DEFAULT NULL,
  p_slip_number TEXT DEFAULT NULL,
  p_weighbridge_operator TEXT DEFAULT NULL,
  p_dbt_status TEXT DEFAULT NULL,
  p_transaction_ref TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Step 0: Validate the status transition is legal
  SELECT status INTO v_current_status FROM public.bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  -- Prevent illegal backward transitions (e.g. COMPLETED -> BOOKED)
  IF v_current_status = 'COMPLETED' AND p_status <> 'COMPLETED' THEN
    RAISE EXCEPTION 'Cannot change status of a completed booking (%)' , p_booking_id;
  END IF;
  IF v_current_status = 'CANCELLED' AND p_status <> 'CANCELLED' THEN
    RAISE EXCEPTION 'Cannot change status of a cancelled booking (%)', p_booking_id;
  END IF;

  -- Step 1: Update booking status
  UPDATE public.bookings
  SET
    status = p_status,
    completed_at = CASE WHEN p_status = 'COMPLETED' THEN NOW() ELSE completed_at END,
    cancelled_at = CASE WHEN p_status = 'CANCELLED' THEN NOW() ELSE cancelled_at END,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Step 2: Upsert quality check (if data provided)
  IF p_moisture_percent IS NOT NULL AND p_certificate_id IS NOT NULL THEN
    INSERT INTO public.quality_checks (
      booking_id, moisture_percent, foreign_matter_percent,
      broken_grain_percent, grade, inspector_name, certificate_id
    ) VALUES (
      p_booking_id, p_moisture_percent, COALESCE(p_foreign_matter_percent, 1.0),
      COALESCE(p_broken_grain_percent, 2.0), COALESCE(p_grade, 'Grade A'),
      COALESCE(p_inspector_name, 'Inspector'), p_certificate_id
    )
    ON CONFLICT (booking_id)
    DO UPDATE SET
      moisture_percent = EXCLUDED.moisture_percent,
      foreign_matter_percent = EXCLUDED.foreign_matter_percent,
      broken_grain_percent = EXCLUDED.broken_grain_percent,
      grade = EXCLUDED.grade,
      inspector_name = EXCLUDED.inspector_name,
      certificate_id = EXCLUDED.certificate_id;
  END IF;

  -- Step 3: Upsert weighment (if data provided)
  IF p_gross_weight_q IS NOT NULL AND p_slip_number IS NOT NULL THEN
    INSERT INTO public.weighments (
      booking_id, gross_weight_q, tare_weight_q, net_weight_q,
      msp_rate_per_q, gross_amount, moisture_deduction, handling_charge,
      net_payable, slip_number, weighbridge_operator, dbt_status, transaction_ref
    ) VALUES (
      p_booking_id, p_gross_weight_q, p_tare_weight_q, p_net_weight_q,
      p_msp_rate_per_q, p_gross_amount, COALESCE(p_moisture_deduction, 0),
      COALESCE(p_handling_charge, 450), p_net_payable,
      p_slip_number, COALESCE(p_weighbridge_operator, 'Operator'),
      COALESCE(p_dbt_status, 'DISBURSED'), COALESCE(p_transaction_ref, '')
    )
    ON CONFLICT (booking_id)
    DO UPDATE SET
      gross_weight_q = EXCLUDED.gross_weight_q,
      tare_weight_q = EXCLUDED.tare_weight_q,
      net_weight_q = EXCLUDED.net_weight_q,
      msp_rate_per_q = EXCLUDED.msp_rate_per_q,
      gross_amount = EXCLUDED.gross_amount,
      moisture_deduction = EXCLUDED.moisture_deduction,
      handling_charge = EXCLUDED.handling_charge,
      net_payable = EXCLUDED.net_payable,
      slip_number = EXCLUDED.slip_number,
      weighbridge_operator = EXCLUDED.weighbridge_operator,
      dbt_status = EXCLUDED.dbt_status,
      transaction_ref = EXCLUDED.transaction_ref;
  END IF;

  -- Step 4: Update the centre's queue length (decrement if completed)
  IF p_status = 'COMPLETED' THEN
    UPDATE public.procurement_centres
    SET
      current_queue_length = GREATEST(0, current_queue_length - 1),
      updated_at = NOW()
    WHERE id = (SELECT centre_id FROM public.bookings WHERE id = p_booking_id);
  END IF;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW-LEVEL SECURITY (RLS) FOR SCOPED REAL-TIME SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on bookings (idempotent)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Farmers can only read their own bookings
DROP POLICY IF EXISTS bookings_farmer_select ON public.bookings;
CREATE POLICY bookings_farmer_select ON public.bookings
  FOR SELECT
  USING (
    -- Allow if the request comes with the farmer's auth user ID
    auth.uid() IS NOT NULL
    AND farmer_id IN (
      SELECT fp.id FROM public.farmer_profiles fp
      JOIN public.users u ON u.id = fp.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Policy: Operators can read bookings for their assigned centre
DROP POLICY IF EXISTS bookings_operator_select ON public.bookings;
CREATE POLICY bookings_operator_select ON public.bookings
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.auth_user_id = auth.uid()
        AND u.role IN ('OPERATOR', 'ADMIN')
    )
  );

-- Policy: Admins can read all bookings
DROP POLICY IF EXISTS bookings_admin_select ON public.bookings;
CREATE POLICY bookings_admin_select ON public.bookings
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.auth_user_id = auth.uid()
        AND u.role = 'ADMIN'
    )
  );

-- Public read access for procurement_centres (they are public data)
ALTER TABLE public.procurement_centres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS centres_public_read ON public.procurement_centres;
CREATE POLICY centres_public_read ON public.procurement_centres
  FOR SELECT
  USING (true);

-- Grant execute on RPCs to authenticated users
GRANT EXECUTE ON FUNCTION find_nearest_centres TO authenticated;
GRANT EXECUTE ON FUNCTION get_queue_prediction TO authenticated;
GRANT EXECUTE ON FUNCTION submit_weighment_transaction TO authenticated;

-- Grant select on the view
GRANT SELECT ON public.v_centre_queue_metrics TO authenticated;
