-- ==============================================================================
-- KISHAN SEVA — FULL SUPABASE DATABASE SETUP & SEED SCRIPT (IDEMPOTENT)
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop of existing Kishan tables to ensure full fresh schema alignment
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.weighments CASCADE;
DROP TABLE IF EXISTS public.quality_checks CASCADE;
DROP TABLE IF EXISTS public.procurements CASCADE;
DROP TABLE IF EXISTS public.queue_events CASCADE;
DROP TABLE IF EXISTS public.queue_snapshots CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.slots CASCADE;
DROP TABLE IF EXISTS public.centre_supported_crops CASCADE;
DROP TABLE IF EXISTS public.procurement_centres CASCADE;
DROP TABLE IF EXISTS public.farmer_crops CASCADE;
DROP TABLE IF EXISTS public.crops CASCADE;
DROP TABLE IF EXISTS public.operator_profiles CASCADE;
DROP TABLE IF EXISTS public.farmer_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  role VARCHAR(50) NOT NULL DEFAULT 'FARMER',
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Farmer Profiles
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  farmer_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  aadhaar_last4 VARCHAR(10) DEFAULT '8842',
  state VARCHAR(100) DEFAULT 'West Bengal',
  district VARCHAR(100) DEFAULT 'North 24 Parganas',
  village VARCHAR(100) DEFAULT 'Basirhat',
  land_area_acres DECIMAL(10, 2) DEFAULT 4.3,
  bank_name VARCHAR(255) DEFAULT 'State Bank of India',
  account_number_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-4591',
  ifsc_code VARCHAR(50) DEFAULT 'SBIN0001245',
  verification_status VARCHAR(50) DEFAULT 'VERIFIED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Crops Table & MSP Reference
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

-- 4. Procurement Centres (Mandis)
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
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  contact_number VARCHAR(50) DEFAULT '+91 33 2568 1122',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bookings & Digital Tokens
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number VARCHAR(50) UNIQUE NOT NULL,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE SET NULL,
  farmer_name VARCHAR(255) NOT NULL,
  farmer_phone VARCHAR(50) NOT NULL,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE RESTRICT,
  centre_name VARCHAR(255) NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  expected_quantity_q DECIMAL(10, 2) NOT NULL,
  slot_date DATE NOT NULL,
  slot_time VARCHAR(100) NOT NULL,
  vehicle_number VARCHAR(50) DEFAULT 'WB 25 B 4821',
  vehicle_type VARCHAR(100) DEFAULT 'Tractor Trolley',
  status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Quality Checks (Assay Lab)
CREATE TABLE public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  moisture_percent DECIMAL(5, 2) NOT NULL,
  foreign_matter_percent DECIMAL(5, 2) DEFAULT 1.0,
  broken_grain_percent DECIMAL(5, 2) DEFAULT 2.0,
  grade VARCHAR(50) NOT NULL DEFAULT 'Grade A',
  inspector_name VARCHAR(255) NOT NULL DEFAULT 'Subhasish Das',
  certificate_id VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Weighments & Official e-J-Form Slips
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
  dbt_status VARCHAR(50) NOT NULL DEFAULT 'DISBURSED',
  transaction_ref VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper RPC function to increment queue count safely
CREATE OR REPLACE FUNCTION increment_centre_queue(c_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.procurement_centres
  SET current_queue_length = current_queue_length + 1
  WHERE id = c_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all farmer_profiles" ON public.farmer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all crops" ON public.crops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all procurement_centres" ON public.procurement_centres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all quality_checks" ON public.quality_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all weighments" ON public.weighments FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTION REGISTRATION
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_centres;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quality_checks;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.weighments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- 1. Crops & MSP
INSERT INTO public.crops (name, name_hi, name_bn, season, msp_rate_per_quintal) VALUES
  ('Paddy (Grade A)', 'धान (ग्रेड ए)', 'ধান (গ্রেড এ)', 'Kharif 2026', 2183.00),
  ('Common Paddy', 'सामान्य धान', 'সাধারণ ধান', 'Kharif 2026', 2163.00),
  ('Wheat', 'गेहूं', 'গম', 'Rabi 2026', 2275.00),
  ('Mustard', 'सरसों', 'সরিষা', 'Rabi 2026', 5650.00),
  ('Maize', 'मक्का', 'ভুট্টা', 'Kharif 2026', 2090.00),
  ('Gram (Chana)', 'चना', 'ছোলা', 'Rabi 2026', 5440.00);

-- 2. Mandi Procurement Centres
INSERT INTO public.procurement_centres 
  (id, centre_code, name, address, state, district, latitude, longitude, daily_capacity_quintals, current_queue_length, est_wait_time_mins, distance_km, accepted_crops, status, contact_number) 
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'KSP-001', 'Krishnapur Procurement Centre', 'Krishnapur Main Road, Near Gram Panchayat Office', 'West Bengal', 'North 24 Parganas', 22.6231, 88.4357, 500, 14, 45, 4.2, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Maize'], 'ACTIVE', '+91 33 2568 1122'),
  ('c2222222-2222-2222-2222-222222222222', 'KSP-002', 'Rajarhat Krishi Mandi Complex', 'Rajarhat Chowmatha, Action Area II', 'West Bengal', 'North 24 Parganas', 22.6152, 88.4651, 800, 5, 20, 6.8, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'], 'ACTIVE', '+91 33 2590 4455'),
  ('c3333333-3333-3333-3333-333333333333', 'KSP-003', 'Barasat Govt. Central Procurement Yard', 'NH-12, Near Dakbungalow More', 'West Bengal', 'North 24 Parganas', 22.7231, 88.4812, 1200, 22, 85, 12.5, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)'], 'ACTIVE', '+91 33 2552 8901'),
  ('c4444444-4444-4444-4444-444444444444', 'KSP-004', 'Madhyamgram Krishi Kalyan Kendra', 'Madhyamgram Chowmatha, Sodepur Road', 'West Bengal', 'North 24 Parganas', 22.6987, 88.4521, 600, 9, 35, 8.1, ARRAY['Paddy (Grade A)', 'Mustard', 'Maize'], 'ACTIVE', '+91 33 2538 6720'),
  ('c5555555-5555-5555-5555-555555555555', 'KSP-005', 'Habra Sub-Divisional Procurement Depot', 'Jessore Road, Near Habra Railway Yard', 'West Bengal', 'North 24 Parganas', 22.8402, 88.6321, 750, 12, 50, 18.3, ARRAY['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Jute'], 'ACTIVE', '+91 32 1623 8899'),
  ('c6666666-6666-6666-6666-666666666666', 'KSP-006', 'Bongaon Border Agrico Cooperative Yard', 'Station Road, Bongaon North', 'West Bengal', 'North 24 Parganas', 23.0425, 88.8284, 900, 4, 15, 34.0, ARRAY['Paddy (Grade A)', 'Wheat', 'Maize', 'Mustard'], 'ACTIVE', '+91 32 1525 1100');

-- 3. Demo Farmer Profile
INSERT INTO public.farmer_profiles
  (id, farmer_code, full_name, phone, aadhaar_last4, state, district, village, land_area_acres, bank_name, account_number_masked, ifsc_code, verification_status)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'KIS-FMR-00001', 'Rohit Mandal', '9876543210', '8842', 'West Bengal', 'North 24 Parganas', 'Basirhat', 4.30, 'State Bank of India', 'XXXX-XXXX-4591', 'SBIN0001245', 'VERIFIED');

-- 4. Initial Sample Booking (for instant queue testing)
INSERT INTO public.bookings 
  (id, token_number, farmer_id, farmer_name, farmer_phone, centre_id, centre_name, crop_name, expected_quantity_q, slot_date, slot_time, vehicle_number, vehicle_type, status)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'KSP-1042', 'f1111111-1111-1111-1111-111111111111', 'Rohit Mandal', '9876543210', 'c1111111-1111-1111-1111-111111111111', 'Krishnapur Procurement Centre', 'Paddy (Grade A)', 50.00, CURRENT_DATE, '10:00 AM - 11:00 AM', 'WB 25 B 4821', 'Tractor Trolley', 'QUALITY_TESTING');

-- 5. Quality Check Record for KSP-1042
INSERT INTO public.quality_checks 
  (booking_id, moisture_percent, foreign_matter_percent, broken_grain_percent, grade, inspector_name, certificate_id)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 13.80, 1.20, 2.10, 'Grade A', 'Subhasish Das (Chief Inspector)', 'QC-KSP-2026-0889');
