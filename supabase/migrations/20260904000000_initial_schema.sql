-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types
CREATE TYPE user_role AS ENUM ('FARMER', 'OPERATOR', 'ADMIN', 'CENTRE_MANAGER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'DEMO_VERIFIED');
CREATE TYPE centre_status AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE slot_status AS ENUM ('OPEN', 'FULL', 'CLOSED', 'COMPLETED');
CREATE TYPE booking_status AS ENUM ('BOOKED', 'CHECKED_IN', 'WAITING', 'CALLED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE queue_event_type AS ENUM ('CHECK_IN', 'CALL', 'START_PROCESSING', 'COMPLETE', 'SKIP', 'NO_SHOW');
CREATE TYPE procurement_status AS ENUM ('PENDING', 'QC_PENDING', 'QC_ACCEPTED', 'QC_REJECTED', 'WEIGHMENT_DONE', 'PROCURED');
CREATE TYPE qc_result AS ENUM ('ACCEPTED', 'REJECTED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- Tables
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'FARMER',
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  farmer_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  aadhaar_token VARCHAR(255), -- Masked or tokenized
  state VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  land_area_acres DECIMAL(10, 2),
  verification_status verification_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.operator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  centre_id UUID, -- Will add FK after procurement_centres table
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  local_name VARCHAR(100),
  season VARCHAR(50),
  unit VARCHAR(20) NOT NULL DEFAULT 'Quintal',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.farmer_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE RESTRICT NOT NULL,
  season VARCHAR(50),
  area_acres DECIMAL(10, 2),
  expected_quantity DECIMAL(10, 2),
  unit VARCHAR(20) DEFAULT 'Quintal',
  expected_harvest_date DATE,
  status VARCHAR(50) DEFAULT 'PLANTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.procurement_centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  state VARCHAR(100),
  district VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  daily_capacity DECIMAL(10, 2),
  opening_time TIME,
  closing_time TIME,
  status centre_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key to operator_profiles now that procurement_centres exists
ALTER TABLE public.operator_profiles 
  ADD CONSTRAINT fk_operator_centre FOREIGN KEY (centre_id) REFERENCES public.procurement_centres(id) ON DELETE SET NULL;

CREATE TABLE public.centre_supported_crops (
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (centre_id, crop_id)
);

CREATE TABLE public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  booked_count INTEGER NOT NULL DEFAULT 0,
  status slot_status DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (centre_id, slot_date, start_time, end_time)
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE RESTRICT NOT NULL,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE RESTRICT NOT NULL,
  slot_id UUID REFERENCES public.slots(id) ON DELETE RESTRICT NOT NULL,
  expected_quantity DECIMAL(10, 2) NOT NULL,
  token_number VARCHAR(50) UNIQUE,
  queue_sequence INTEGER,
  status booking_status DEFAULT 'BOOKED',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE NOT NULL,
  event_type queue_event_type NOT NULL,
  sequence_no INTEGER,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.queue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID REFERENCES public.procurement_centres(id) ON DELETE CASCADE NOT NULL,
  snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  queue_length INTEGER NOT NULL DEFAULT 0,
  processing_count INTEGER NOT NULL DEFAULT 0,
  scheduled_remaining INTEGER NOT NULL DEFAULT 0,
  predicted_queue INTEGER NOT NULL DEFAULT 0,
  predicted_wait_minutes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.procurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procurement_code VARCHAR(50) UNIQUE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE RESTRICT UNIQUE NOT NULL,
  actual_quantity DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  total_amount DECIMAL(12, 2),
  status procurement_status DEFAULT 'PENDING',
  receipt_number VARCHAR(100) UNIQUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procurement_id UUID REFERENCES public.procurements(id) ON DELETE CASCADE UNIQUE NOT NULL,
  moisture_percent DECIMAL(5, 2),
  quality_grade VARCHAR(20),
  foreign_matter_percent DECIMAL(5, 2),
  result qc_result,
  rejection_reason TEXT,
  checked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.weighments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procurement_id UUID REFERENCES public.procurements(id) ON DELETE CASCADE UNIQUE NOT NULL,
  expected_quantity DECIMAL(10, 2),
  actual_quantity DECIMAL(10, 2),
  unit VARCHAR(20) DEFAULT 'Quintal',
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procurement_id UUID REFERENCES public.procurements(id) ON DELETE CASCADE UNIQUE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status payment_status DEFAULT 'PENDING',
  transaction_reference VARCHAR(255),
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(50) DEFAULT 'IN_APP',
  status VARCHAR(50) DEFAULT 'UNREAD',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.msp_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  season VARCHAR(50),
  year INTEGER NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  source_reference VARCHAR(255),
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.historical_procurement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(100),
  district VARCHAR(100),
  centre VARCHAR(255),
  crop VARCHAR(100),
  year INTEGER,
  quantity DECIMAL(15, 2),
  procurement_value DECIMAL(15, 2),
  source VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_centre_slot_status ON public.bookings(centre_id, slot_id, status);
CREATE INDEX idx_bookings_farmer_status ON public.bookings(farmer_id, status);
CREATE INDEX idx_slots_centre_date ON public.slots(centre_id, slot_date);
CREATE INDEX idx_queue_events_centre_time ON public.queue_events(centre_id, event_time);
CREATE INDEX idx_procurements_booking ON public.procurements(booking_id);
CREATE INDEX idx_payments_procurement ON public.payments(procurement_id);
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_queue_snapshots_centre_time ON public.queue_snapshots(centre_id, snapshot_time);
