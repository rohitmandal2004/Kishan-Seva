-- Supabase Migration: 20260905000000_production_schema.sql
-- Production schema for Kishan Seva

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  role VARCHAR(50) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'OPERATOR', 'ADMIN', 'CENTRE_MANAGER')),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.farmer_profiles (
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

CREATE TABLE IF NOT EXISTS public.crops (
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

CREATE TABLE IF NOT EXISTS public.procurement_centres (
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

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number VARCHAR(50) UNIQUE NOT NULL,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE SET NULL,
  farmer_name VARCHAR(255) NOT NULL,
  farmer_phone VARCHAR(50) NOT NULL,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE RESTRICT NOT NULL,
  centre_name VARCHAR(255) NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  expected_quantity_q DECIMAL(10, 2) NOT NULL,
  slot_date DATE NOT NULL,
  slot_time VARCHAR(100) NOT NULL,
  vehicle_number VARCHAR(50) DEFAULT 'WB 25 B 4821',
  vehicle_type VARCHAR(100) DEFAULT 'Tractor Trolley',
  queue_sequence INTEGER DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  moisture_percent DECIMAL(5, 2) NOT NULL,
  foreign_matter_percent DECIMAL(5, 2) DEFAULT 1.0,
  broken_grain_percent DECIMAL(5, 2) DEFAULT 2.0,
  grade VARCHAR(50) NOT NULL DEFAULT 'Grade A',
  inspector_name VARCHAR(255) NOT NULL DEFAULT 'Subhasish Das (Chief Inspector)',
  certificate_id VARCHAR(100) UNIQUE NOT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weighments (
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
