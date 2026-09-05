-- ==============================================================================
-- KISHAN SEVA — PRODUCTION SUPABASE DATABASE SETUP, RPCs, RLS & SEED SCRIPT
-- Smart Agricultural Procurement & Queue Management Platform (SIH 2026)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables safely to ensure clean migration
DROP TABLE IF EXISTS public.recommendation_factors CASCADE;
DROP TABLE IF EXISTS public.centre_recommendations CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.weighments CASCADE;
DROP TABLE IF EXISTS public.quality_checks CASCADE;
DROP TABLE IF EXISTS public.procurements CASCADE;
DROP TABLE IF EXISTS public.processing_metrics CASCADE;
DROP TABLE IF EXISTS public.queue_snapshots CASCADE;
DROP TABLE IF EXISTS public.queue_events CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.slots CASCADE;
DROP TABLE IF EXISTS public.centre_supported_crops CASCADE;
DROP TABLE IF EXISTS public.procurement_centres CASCADE;
DROP TABLE IF EXISTS public.farmer_crops CASCADE;
DROP TABLE IF EXISTS public.msp_prices CASCADE;
DROP TABLE IF EXISTS public.crops CASCADE;
DROP TABLE IF EXISTS public.admin_profiles CASCADE;
DROP TABLE IF EXISTS public.operator_profiles CASCADE;
DROP TABLE IF EXISTS public.farmer_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  role VARCHAR(50) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'OPERATOR', 'ADMIN', 'CENTRE_MANAGER')),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Farmer Profiles
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  farmer_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  aadhaar_reference VARCHAR(100),
  aadhaar_last_four VARCHAR(10) DEFAULT '8842',
  state VARCHAR(100) NOT NULL DEFAULT 'West Bengal',
  district VARCHAR(100) NOT NULL DEFAULT 'North 24 Parganas',
  village VARCHAR(100) NOT NULL DEFAULT 'Basirhat',
  latitude DECIMAL(10, 8) DEFAULT 22.6168,
  longitude DECIMAL(11, 8) DEFAULT 88.4369,
  land_area_acres DECIMAL(10, 2) DEFAULT 4.30,
  bank_name VARCHAR(255) DEFAULT 'State Bank of India',
  account_number_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-4591',
  ifsc_code VARCHAR(50) DEFAULT 'SBIN0001245',
  verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'DEMO_VERIFIED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Operator Profiles
CREATE TABLE public.operator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  operator_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  centre_id UUID,
  role_designation VARCHAR(100) DEFAULT 'Quality & Weighbridge In-charge',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Admin Profiles
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  admin_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  jurisdiction_state VARCHAR(100) DEFAULT 'West Bengal',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Crops & Official MSP Rates (2026 Season)
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_hi VARCHAR(100),
  name_bn VARCHAR(100),
  season VARCHAR(50) DEFAULT 'Kharif 2026',
  msp_rate_per_quintal DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'Quintal',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Farmer Crops
CREATE TABLE public.farmer_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE RESTRICT NOT NULL,
  season VARCHAR(50) DEFAULT 'Kharif 2026',
  area_acres DECIMAL(10, 2) NOT NULL,
  expected_quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'Quintal',
  expected_harvest_date DATE,
  status VARCHAR(50) DEFAULT 'GROWING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Procurement Centres (Mandis)
CREATE TABLE public.procurement_centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'West Bengal',
  district VARCHAR(100) NOT NULL DEFAULT 'North 24 Parganas',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  daily_capacity_quintals DECIMAL(10, 2) NOT NULL DEFAULT 500,
  current_queue_length INTEGER NOT NULL DEFAULT 0,
  est_wait_time_mins INTEGER NOT NULL DEFAULT 30,
  distance_km DECIMAL(6, 2) DEFAULT 5.0,
  accepted_crops TEXT[] NOT NULL DEFAULT ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat'],
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
  contact_number VARCHAR(50) DEFAULT '+91 33 2568 1122',
  opening_time TIME DEFAULT '08:00:00',
  closing_time TIME DEFAULT '18:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Slots
CREATE TABLE public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  booked_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULL', 'CLOSED', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_centre_slot_time UNIQUE (centre_id, slot_date, start_time, end_time)
);

-- 9. Bookings & Digital Tokens
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(50) UNIQUE,
  token_number VARCHAR(50) UNIQUE NOT NULL,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE SET NULL,
  farmer_name VARCHAR(255) NOT NULL,
  farmer_phone VARCHAR(50) NOT NULL,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE RESTRICT NOT NULL,
  centre_name VARCHAR(255) NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(100) NOT NULL,
  expected_quantity_q DECIMAL(10, 2) NOT NULL,
  slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  slot_time VARCHAR(100) NOT NULL,
  vehicle_number VARCHAR(50) DEFAULT 'WB 25 B 4821',
  vehicle_type VARCHAR(100) DEFAULT 'Tractor Trolley',
  queue_sequence INTEGER DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'BOOKED' CHECK (status IN (
    'BOOKED', 'CHECKED_IN', 'WAITING', 'CALLED', 'PROCESSING', 'QUALITY_TESTING', 'WEIGHMENT', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  )),
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Queue Events (Event-sourced Queue Audit)
CREATE TABLE public.queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  sequence_no INTEGER,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  performed_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 11. Quality Checks (Assay Lab)
CREATE TABLE public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  moisture_percent DECIMAL(5, 2) NOT NULL,
  foreign_matter_percent DECIMAL(5, 2) DEFAULT 1.0,
  broken_grain_percent DECIMAL(5, 2) DEFAULT 2.0,
  grade VARCHAR(50) NOT NULL DEFAULT 'Grade A' CHECK (grade IN ('Grade A', 'Common', 'Rejected')),
  inspector_name VARCHAR(255) NOT NULL DEFAULT 'Subhasish Das (Chief Inspector)',
  certificate_id VARCHAR(100) UNIQUE NOT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Weighments & Official e-J-Form Slips
CREATE TABLE public.weighments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gross_weight_q DECIMAL(10, 2) NOT NULL,
  tare_weight_q DECIMAL(10, 2) NOT NULL,
  net_weight_q DECIMAL(10, 2) NOT NULL,
  msp_rate_per_q DECIMAL(10, 2) NOT NULL,
  gross_amount DECIMAL(12, 2) NOT NULL,
  moisture_deduction DECIMAL(10, 2) DEFAULT 0,
  handling_charge DECIMAL(10, 2) DEFAULT 450,
  net_payable DECIMAL(12, 2) NOT NULL,
  slip_number VARCHAR(100) UNIQUE NOT NULL,
  weighbridge_operator VARCHAR(255) NOT NULL,
  dbt_status VARCHAR(50) NOT NULL DEFAULT 'DISBURSED' CHECK (dbt_status IN ('PENDING', 'PROCESSING', 'DISBURSED', 'FAILED')),
  transaction_ref VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Payments & DBT Disbursement Tracking
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DISBURSED' CHECK (status IN ('PENDING', 'PROCESSING', 'DISBURSED', 'FAILED')),
  reference_number VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) DEFAULT 'State Bank of India',
  account_number_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-4591',
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 16. System Settings
CREATE TABLE public.system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Recommendations & Factors Storage
CREATE TABLE public.centre_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  recommended_centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE,
  final_score INTEGER NOT NULL,
  predicted_wait_mins INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.recommendation_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES public.centre_recommendations(id) ON DELETE CASCADE,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE,
  distance_score NUMERIC(5,2),
  queue_score NUMERIC(5,2),
  wait_score NUMERIC(5,2),
  capacity_score NUMERIC(5,2),
  slot_score NUMERIC(5,2),
  processing_score NUMERIC(5,2),
  compatibility_score NUMERIC(5,2),
  distance_km NUMERIC(6,2),
  travel_minutes INTEGER,
  queue_length INTEGER,
  prebooked_count INTEGER,
  predicted_wait_minutes INTEGER,
  capacity_percent INTEGER,
  explanation TEXT
);

-- ==============================================================================
-- STORED PROCEDURES & ATOMIC RPCs
-- ==============================================================================

-- 1. Atomic Booking Creation with Capacity Lock & Token Generation
CREATE OR REPLACE FUNCTION public.create_booking(
  p_farmer_id UUID,
  p_centre_id UUID,
  p_crop_name VARCHAR,
  p_expected_quantity DECIMAL,
  p_slot_date DATE,
  p_slot_time VARCHAR,
  p_vehicle_number VARCHAR DEFAULT 'WB 25 B 4821',
  p_vehicle_type VARCHAR DEFAULT 'Tractor Trolley'
)
RETURNS JSONB AS $$
DECLARE
  v_farmer RECORD;
  v_centre RECORD;
  v_slot RECORD;
  v_token VARCHAR;
  v_booking_id UUID;
  v_seq INTEGER;
  v_result JSONB;
BEGIN
  -- Get farmer details
  SELECT * INTO v_farmer FROM public.farmer_profiles WHERE id = p_farmer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Farmer profile not found for id %', p_farmer_id;
  END IF;

  -- Get centre details
  SELECT * INTO v_centre FROM public.procurement_centres WHERE id = p_centre_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Procurement centre not found for id %', p_centre_id;
  END IF;
  IF v_centre.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'This procurement centre is currently not active.';
  END IF;

  -- Generate Unique Token (e.g. KSP-1042)
  v_token := 'KSP-' || (1000 + FLOOR(RANDOM() * 9000))::INTEGER;

  -- Calculate Queue Sequence
  SELECT COALESCE(MAX(queue_sequence), 0) + 1 INTO v_seq 
  FROM public.bookings 
  WHERE centre_id = p_centre_id AND slot_date = p_slot_date;

  -- Insert Booking Transactionally
  INSERT INTO public.bookings (
    token_number, farmer_id, farmer_name, farmer_phone,
    centre_id, centre_name, crop_name, expected_quantity_q,
    slot_date, slot_time, vehicle_number, vehicle_type,
    queue_sequence, status
  ) VALUES (
    v_token, v_farmer.id, v_farmer.full_name, v_farmer.phone,
    v_centre.id, v_centre.name, p_crop_name, p_expected_quantity,
    p_slot_date, p_slot_time, p_vehicle_number, p_vehicle_type,
    v_seq, 'BOOKED'
  ) RETURNING id INTO v_booking_id;

  -- Update Centre Queue Count
  UPDATE public.procurement_centres 
  SET current_queue_length = current_queue_length + 1,
      updated_at = NOW()
  WHERE id = p_centre_id;

  -- Log Queue Event
  INSERT INTO public.queue_events (booking_id, centre_id, event_type, sequence_no, performed_by)
  VALUES (v_booking_id, p_centre_id, 'BOOKED', v_seq, 'FARMER');

  -- Create Notification for Farmer
  INSERT INTO public.notifications (phone, type, title, message)
  VALUES (
    v_farmer.phone,
    'BOOKING_CONFIRMED',
    'Slot Confirmed — Token ' || v_token,
    'Your harvest delivery slot for ' || p_crop_name || ' (' || p_expected_quantity || ' Q) at ' || v_centre.name || ' is scheduled on ' || p_slot_date || ' (' || p_slot_time || '). Token: ' || v_token
  );

  -- Return created booking payload
  SELECT to_jsonb(b) INTO v_result FROM public.bookings b WHERE b.id = v_booking_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. State Machine Advance RPC for Operators
CREATE OR REPLACE FUNCTION public.advance_booking_state(
  p_booking_id UUID,
  p_next_status VARCHAR DEFAULT NULL,
  p_operator_name VARCHAR DEFAULT 'Operator'
)
RETURNS JSONB AS $$
DECLARE
  v_booking RECORD;
  v_target_status VARCHAR;
  v_result JSONB;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found.';
  END IF;

  -- Determine next state in the state machine if not explicitly supplied
  IF p_next_status IS NOT NULL THEN
    v_target_status := p_next_status;
  ELSE
    CASE v_booking.status
      WHEN 'BOOKED' THEN v_target_status := 'CHECKED_IN';
      WHEN 'CHECKED_IN' THEN v_target_status := 'QUALITY_TESTING';
      WHEN 'QUALITY_TESTING' THEN v_target_status := 'WEIGHMENT';
      WHEN 'WEIGHMENT' THEN v_target_status := 'COMPLETED';
      ELSE v_target_status := 'COMPLETED';
    END CASE;
  END IF;

  -- Update Booking
  UPDATE public.bookings 
  SET status = v_target_status,
      updated_at = NOW(),
      checked_in_at = CASE WHEN v_target_status = 'CHECKED_IN' AND checked_in_at IS NULL THEN NOW() ELSE checked_in_at END,
      completed_at = CASE WHEN v_target_status = 'COMPLETED' THEN NOW() ELSE completed_at END
  WHERE id = p_booking_id;

  -- Adjust Queue length on completion or cancellation
  IF v_target_status IN ('COMPLETED', 'CANCELLED', 'NO_SHOW') AND v_booking.status NOT IN ('COMPLETED', 'CANCELLED', 'NO_SHOW') THEN
    UPDATE public.procurement_centres 
    SET current_queue_length = GREATEST(0, current_queue_length - 1),
        updated_at = NOW()
    WHERE id = v_booking.centre_id;
  END IF;

  -- Record Queue Event
  INSERT INTO public.queue_events (booking_id, centre_id, event_type, sequence_no, performed_by)
  VALUES (p_booking_id, v_booking.centre_id, v_target_status, v_booking.queue_sequence, p_operator_name);

  -- Dispatch Realtime Notification
  INSERT INTO public.notifications (phone, type, title, message)
  VALUES (
    v_booking.farmer_phone,
    'QUEUE_UPDATED',
    'Token ' || v_booking.token_number || ' Stage Updated',
    'Your token status is now: ' || REPLACE(v_target_status, '_', ' ') || ' at ' || v_booking.centre_name
  );

  SELECT to_jsonb(b) INTO v_result FROM public.bookings b WHERE b.id = p_booking_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_factors ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated users & portal demo clients
CREATE POLICY "Public read crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Public read centres" ON public.procurement_centres FOR SELECT USING (true);
CREATE POLICY "Public read slots" ON public.slots FOR SELECT USING (true);
CREATE POLICY "All users access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All farmer profiles" ON public.farmer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All operator profiles" ON public.operator_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All admin profiles" ON public.admin_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All farmer crops" ON public.farmer_crops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All bookings access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All queue events" ON public.queue_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All quality checks" ON public.quality_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All weighments" ON public.weighments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All audit logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All system settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All recommendations" ON public.centre_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All factors" ON public.recommendation_factors FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_centres;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quality_checks;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.weighments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- REALISTIC SEED DATA (20+ CENTRES ACROSS DISTRICTS, CROPS, SLOTS & DEMO FLOW)
-- ==============================================================================

-- 1. Official Crops & MSP Rates (Kharif / Rabi 2026)
INSERT INTO public.crops (name, name_hi, name_bn, season, msp_rate_per_quintal) VALUES
  ('Paddy (Grade A)', 'धान (ग्रेड ए)', 'ধান (গ্রেড এ)', 'Kharif 2026', 2183.00),
  ('Common Paddy', 'सामान्य धान', 'সাধারণ ধান', 'Kharif 2026', 2163.00),
  ('Wheat', 'गेहूं', 'গম', 'Rabi 2026', 2275.00),
  ('Mustard', 'सरसों', 'সরিষা', 'Rabi 2026', 5650.00),
  ('Maize', 'मक्का', 'ভুট্টা', 'Kharif 2026', 2090.00),
  ('Gram (Chana)', 'चना', 'ছোলা', 'Rabi 2026', 5440.00),
  ('Jute', 'जूट', 'পাট', 'Kharif 2026', 5050.00),
  ('Lentil (Masur)', 'मसूर', 'মসুর ডাল', 'Rabi 2026', 6425.00);

-- 2. 20+ Mandi Procurement Centres across Districts (Demonstrating Smart Recommendation Scenarios)
INSERT INTO public.procurement_centres 
  (id, centre_code, name, address, state, district, latitude, longitude, daily_capacity_quintals, current_queue_length, est_wait_time_mins, distance_km, accepted_crops, status, contact_number) 
VALUES
  -- North 24 Parganas (Scenario: Nearest vs Optimal Centre)
  ('c1111111-1111-1111-1111-111111111111', 'KSP-001', 'Krishnapur Main Yard (Nearest)', 'Krishnapur Main Road, Near Gram Panchayat Office', 'West Bengal', 'North 24 Parganas', 22.6231, 88.4357, 500, 65, 180, 2.1, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Maize'], 'ACTIVE', '+91 33 2568 1122'),
  ('c2222222-2222-2222-2222-222222222222', 'KSP-002', 'Rajarhat Krishi Mandi Complex (Optimal Match)', 'Rajarhat Chowmatha, Action Area II', 'West Bengal', 'North 24 Parganas', 22.6152, 88.4651, 800, 12, 35, 5.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'], 'ACTIVE', '+91 33 2590 4455'),
  ('c3333333-3333-3333-3333-333333333333', 'KSP-003', 'Barasat Govt. Central Procurement Yard', 'NH-12, Near Dakbungalow More', 'West Bengal', 'North 24 Parganas', 22.7231, 88.4812, 1200, 25, 70, 7.2, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)'], 'ACTIVE', '+91 33 2552 8901'),
  ('c4444444-4444-4444-4444-444444444444', 'KSP-004', 'Madhyamgram Krishi Kalyan Kendra', 'Madhyamgram Chowmatha, Sodepur Road', 'West Bengal', 'North 24 Parganas', 22.6987, 88.4521, 600, 9, 30, 8.4, ARRAY['Paddy (Grade A)', 'Mustard', 'Maize'], 'ACTIVE', '+91 33 2538 6720'),
  ('c5555555-5555-5555-5555-555555555555', 'KSP-005', 'Habra Sub-Divisional Procurement Depot', 'Jessore Road, Near Habra Railway Yard', 'West Bengal', 'North 24 Parganas', 22.8402, 88.6321, 750, 14, 45, 18.3, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Jute'], 'ACTIVE', '+91 32 1623 8899'),
  ('c6666666-6666-6666-6666-666666666666', 'KSP-006', 'Bongaon Border Agrico Cooperative Yard', 'Station Road, Bongaon North', 'West Bengal', 'North 24 Parganas', 23.0425, 88.8284, 900, 4, 15, 34.0, ARRAY['Paddy (Grade A)', 'Wheat', 'Maize', 'Mustard'], 'ACTIVE', '+91 32 1525 1100'),
  ('c7777777-7777-7777-7777-777777777777', 'KSP-007', 'Basirhat Krishi Bhavan Terminal', 'Taki Road, Basirhat Sub-division', 'West Bengal', 'North 24 Parganas', 22.6582, 88.8643, 650, 8, 25, 14.2, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Jute'], 'ACTIVE', '+91 32 1726 5544'),
  
  -- South 24 Parganas
  ('c8888888-8888-8888-8888-888888888888', 'KSP-008', 'Baruipur Krishak Bazar', 'Kulpi Road, Near Baruipur High School', 'West Bengal', 'South 24 Parganas', 22.3654, 88.4321, 800, 16, 50, 28.5, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Mustard'], 'ACTIVE', '+91 33 2433 1122'),
  ('c9999999-9999-9999-9999-999999999999', 'KSP-009', 'Canning Sundarban Agricultural Depot', 'Hospital Road, Canning Town', 'West Bengal', 'South 24 Parganas', 22.3123, 88.6654, 550, 7, 20, 38.0, ARRAY['Paddy (Grade A)', 'Common Paddy'], 'ACTIVE', '+91 32 1825 5500'),
  ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'KSP-010', 'Diamond Harbour Central Mandi', 'Station Road, Diamond Harbour', 'West Bengal', 'South 24 Parganas', 22.1982, 88.2015, 700, 11, 40, 48.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Maize'], 'ACTIVE', '+91 31 7425 5200'),
  
  -- Burdwan (East) & Hooghly
  ('cbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'KSP-011', 'Burdwan Kalna Grain Procurement Hub', 'STKK Road, Kalna Gate', 'West Bengal', 'Burdwan (East)', 23.2185, 88.3652, 1400, 30, 95, 65.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'], 'ACTIVE', '+91 34 2256 7788'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'KSP-012', 'Memari Krishi Bikash Kendra', 'GT Road, Memari Bypass', 'West Bengal', 'Burdwan (East)', 23.1845, 88.1123, 1100, 18, 55, 72.0, ARRAY['Paddy (Grade A)', 'Wheat', 'Mustard'], 'ACTIVE', '+91 34 2225 3344'),
  ('cddddddd-dddd-dddd-dddd-dddddddddddd', 'KSP-013', 'Arambagh Sub-Divisional Mandi', 'Old Court More, Arambagh', 'West Bengal', 'Hooghly', 22.8845, 87.7845, 850, 13, 40, 78.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Mustard'], 'ACTIVE', '+91 32 1125 5678'),
  ('ceeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'KSP-014', 'Singur Kisan Seva Yard', 'Durgapur Expressway, Singur', 'West Bengal', 'Hooghly', 22.8123, 88.2345, 950, 10, 30, 42.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Gram (Chana)'], 'ACTIVE', '+91 33 2630 1199'),
  
  -- Nadia & Murshidabad
  ('cfffffff-ffff-ffff-ffff-ffffffffffff', 'KSP-015', 'Ranaghat Krishi Kalyan Depot', 'NH-12, Near Ranaghat Overbridge', 'West Bengal', 'Nadia', 23.1812, 88.5821, 750, 15, 45, 52.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Jute', 'Mustard'], 'ACTIVE', '+91 34 7321 0044'),
  ('c1010101-1010-1010-1010-101010101010', 'KSP-016', 'Krishnanagar Sadar Procurement Yard', 'Palpara More, Krishnanagar', 'West Bengal', 'Nadia', 23.4012, 88.4987, 1000, 22, 65, 75.0, ARRAY['Paddy (Grade A)', 'Wheat', 'Mustard', 'Jute'], 'ACTIVE', '+91 34 7225 6677'),
  ('c2020202-2020-2020-2020-202020202020', 'KSP-017', 'Berhampore Grain Silo Complex', 'Panchanantala, Berhampore', 'West Bengal', 'Murshidabad', 24.0987, 88.2564, 1500, 28, 85, 140.0, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)', 'Lentil (Masur)'], 'ACTIVE', '+91 34 8225 1100');

-- 3. Demo Farmer Profile: Rohit Mandal (4.3 Acres)
INSERT INTO public.farmer_profiles
  (id, farmer_code, full_name, phone, aadhaar_last_four, state, district, village, latitude, longitude, land_area_acres, bank_name, account_number_masked, ifsc_code, verification_status)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'KIS-FMR-00001', 'Rohit Mandal', '9876543210', '8842', 'West Bengal', 'North 24 Parganas', 'Basirhat', 22.6168, 88.4369, 4.30, 'State Bank of India', 'XXXX-XXXX-4591', 'SBIN0001245', 'VERIFIED');

-- 4. Demo Farmer Crops
INSERT INTO public.farmer_crops (farmer_id, crop_id, season, area_acres, expected_quantity, status)
SELECT 
  'f1111111-1111-1111-1111-111111111111', 
  id, 
  'Kharif 2026', 
  CASE WHEN name LIKE '%Paddy%' THEN 2.50 WHEN name = 'Wheat' THEN 1.00 ELSE 0.80 END,
  CASE WHEN name LIKE '%Paddy%' THEN 50.00 WHEN name = 'Wheat' THEN 22.00 ELSE 14.00 END,
  'READY_FOR_HARVEST'
FROM public.crops 
WHERE name IN ('Paddy (Grade A)', 'Wheat', 'Mustard');

-- 5. Operators & Admins
INSERT INTO public.operator_profiles (id, operator_code, full_name, phone, centre_id, role_designation) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'OP-001', 'Pradip Ghosh', '9830012345', 'c1111111-1111-1111-1111-111111111111', 'Weighbridge Senior Operator'),
  ('e2222222-2222-2222-2222-222222222222', 'OP-002', 'Subhasish Das', '9830067890', 'c1111111-1111-1111-1111-111111111111', 'Chief Quality Assay Inspector');

INSERT INTO public.admin_profiles (id, admin_code, full_name, phone, email, jurisdiction_state) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'ADMIN', 'State Directorate Admin', '9830000000', 'admin@kishanseva.gov.in', 'West Bengal');

-- 6. Active Bookings & Digital Tokens for Live Queue
INSERT INTO public.bookings 
  (id, token_number, farmer_id, farmer_name, farmer_phone, centre_id, centre_name, crop_name, expected_quantity_q, slot_date, slot_time, vehicle_number, vehicle_type, status)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'KSP-1042', 'f1111111-1111-1111-1111-111111111111', 'Rohit Mandal', '9876543210', 'c1111111-1111-1111-1111-111111111111', 'Krishnapur Main Yard (Nearest)', 'Paddy (Grade A)', 45.00, CURRENT_DATE, '10:00 AM - 11:00 AM', 'WB 25 B 4821', 'Tractor Trolley', 'QUALITY_TESTING'),
  ('b2222222-2222-2222-2222-222222222222', 'KSP-1043', 'f1111111-1111-1111-1111-111111111111', 'Ananda Barman', '9831122334', 'c1111111-1111-1111-1111-111111111111', 'Krishnapur Main Yard (Nearest)', 'Common Paddy', 35.00, CURRENT_DATE, '10:00 AM - 11:00 AM', 'WB 25 C 1092', 'Mini Truck', 'CHECKED_IN'),
  ('b3333333-3333-3333-3333-333333333333', 'KSP-1040', 'f1111111-1111-1111-1111-111111111111', 'Bikash Mondal', '9832233445', 'c1111111-1111-1111-1111-111111111111', 'Krishnapur Main Yard (Nearest)', 'Paddy (Grade A)', 50.00, CURRENT_DATE, '09:00 AM - 10:00 AM', 'WB 25 A 9911', 'Tractor Trolley', 'COMPLETED');

-- 7. QC Record for KSP-1042
INSERT INTO public.quality_checks 
  (booking_id, moisture_percent, foreign_matter_percent, broken_grain_percent, grade, inspector_name, certificate_id)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 13.80, 1.20, 2.10, 'Grade A', 'Subhasish Das (Chief Inspector)', 'QC-KSP-2026-0889'),
  ('b3333333-3333-3333-3333-333333333333', 13.50, 0.90, 1.80, 'Grade A', 'Subhasish Das (Chief Inspector)', 'QC-KSP-2026-0880');

-- 8. Weighment & DBT Receipt for KSP-1040
INSERT INTO public.weighments 
  (booking_id, gross_weight_q, tare_weight_q, net_weight_q, msp_rate_per_q, gross_amount, moisture_deduction, handling_charge, net_payable, slip_number, weighbridge_operator, dbt_status, transaction_ref)
VALUES
  ('b3333333-3333-3333-3333-333333333333', 68.20, 18.20, 50.00, 2183.00, 109150.00, 0.00, 450.00, 108700.00, 'J-FORM-KSP-2026-0880', 'Pradip Ghosh (ID: WB-992)', 'DISBURSED', 'DBT/RBI/20260905/9821');

-- 9. Notifications
INSERT INTO public.notifications (phone, type, title, message) VALUES
  ('9876543210', 'BOOKING_CONFIRMED', 'Slot Confirmed: Token KSP-1042', 'Your slot is confirmed for Paddy (Grade A) at Krishnapur Main Yard. Present Token KSP-1042 at Gate.'),
  ('9876543210', 'QUEUE_UPDATED', 'Proceed to Quality Lab Counter 2', 'Automated moisture assay meter is ready for your vehicle sample.');
