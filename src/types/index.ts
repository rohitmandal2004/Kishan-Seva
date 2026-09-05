export type Role = 'FARMER' | 'OPERATOR' | 'ADMIN' | 'CENTRE_MANAGER';
export type UserRole = Role;

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  auth_user_id?: string;
  role: Role;
  phone?: string;
  email?: string;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface FarmerProfile {
  id: string;
  user_id?: string;
  farmer_code: string;
  full_name: string;
  phone: string;
  email?: string;
  aadhaar_reference?: string;
  aadhaar_last_four?: string;
  state: string;
  district: string;
  village: string;
  latitude?: number;
  longitude?: number;
  land_area_acres: number;
  bank_name?: string;
  account_number_masked?: string;
  ifsc_code?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DEMO_VERIFIED';
  created_at?: string;
  updated_at?: string;
}

export interface OperatorProfile {
  id: string;
  user_id?: string;
  operator_code: string;
  full_name: string;
  phone: string;
  centre_id: string;
  role_designation: string; // e.g. 'Quality Inspector', 'Weighbridge Operator'
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface AdminProfile {
  id: string;
  user_id?: string;
  admin_code: string;
  full_name: string;
  phone: string;
  email: string;
  jurisdiction_state: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface Crop {
  id: string;
  name: string;
  name_hi?: string;
  name_bn?: string;
  local_name?: string;
  season: string; // e.g. 'Kharif 2026', 'Rabi 2026'
  msp_rate_per_quintal: number;
  unit: string;
  active: boolean;
  created_at?: string;
}

export interface FarmerCrop {
  id: string;
  farmer_id: string;
  crop_id: string;
  season: string;
  area_acres: number;
  expected_quantity: number;
  unit: string;
  expected_harvest_date?: string;
  status?: string;
  crop?: Crop;
}

export interface ProcurementCentre {
  id: string;
  centre_code: string;
  name: string;
  address: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  daily_capacity_quintals: number;
  current_queue_length: number;
  est_wait_time_mins: number;
  distance_km?: number;
  travel_time_mins?: number;
  accepted_crops: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  contact_number?: string;
  opening_time?: string;
  closing_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CentreSupportedCrop {
  centre_id: string;
  crop_id: string;
}

export interface Slot {
  id: string;
  centre_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'COMPLETED';
  created_at?: string;
}

export type BookingStatus = 
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'CALLED'
  | 'PROCESSING'
  | 'QUALITY_TESTING'
  | 'WEIGHMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Booking {
  id: string;
  booking_code?: string;
  token_number: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  centre_id: string;
  centre_name: string;
  crop_id?: string;
  crop_name: string;
  expected_quantity_q: number;
  slot_id?: string;
  slot_date: string;
  slot_time: string;
  vehicle_number: string;
  vehicle_type: string;
  queue_sequence?: number;
  status: BookingStatus;
  booked_at: string;
  checked_in_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  quality_data?: QualityCheck;
  weighment_data?: Weighment;
  created_at?: string;
  updated_at?: string;
}

export interface QueueEvent {
  id: string;
  booking_id: string;
  centre_id: string;
  event_type: 'BOOKED' | 'CHECKED_IN' | 'CALLED' | 'QC_STARTED' | 'QC_COMPLETED' | 'QC_REJECTED' | 'WEIGHMENT_STARTED' | 'WEIGHMENT_COMPLETED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  sequence_no?: number;
  event_time: string;
  performed_by?: string;
  metadata?: Record<string, any>;
}

export interface QualityCheck {
  id?: string;
  booking_id: string;
  moisture_percent: number;
  foreign_matter_percent: number;
  broken_grain_percent: number;
  grade: 'Grade A' | 'Common' | 'Rejected';
  inspector_name: string;
  certificate_id: string;
  rejection_reason?: string;
  timestamp?: string;
  created_at?: string;
}

export interface Weighment {
  id?: string;
  booking_id: string;
  gross_weight_q: number;
  tare_weight_q: number;
  net_weight_q: number;
  msp_rate_per_q: number;
  gross_amount: number;
  moisture_deduction: number;
  handling_charge: number;
  net_payable: number;
  slip_number: string;
  weighbridge_operator: string;
  dbt_status: 'PENDING' | 'PROCESSING' | 'DISBURSED' | 'FAILED';
  transaction_ref: string;
  timestamp?: string;
  created_at?: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  farmer_id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'DISBURSED' | 'FAILED';
  reference_number: string;
  bank_name: string;
  account_number_masked: string;
  payment_date?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  phone?: string;
  type: 'BOOKING_CONFIRMED' | 'SLOT_REMINDER' | 'QUEUE_UPDATED' | 'TURN_APPROACHING' | 'QC_PASSED' | 'PROCUREMENT_COMPLETED' | 'PAYMENT_UPDATED' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface CentreRecommendation {
  centre: ProcurementCentre;
  journey_score: number; // 0 to 100
  distance_km: number;
  travel_time_mins: number;
  current_queue: number;
  predicted_wait_mins: number;
  capacity_utilization_percent: number;
  is_optimal: boolean;
  is_nearest: boolean;
  savings_mins?: number;
  explanation: {
    title: string;
    badges: string[];
    tradeoff: string;
    reasons: string[];
  };
  factors: {
    distance_score: number;
    queue_score: number;
    wait_score: number;
    capacity_score: number;
    slot_score: number;
    processing_score: number;
    compatibility_score: number;
  };
}

export interface QueuePrediction {
  centre_id: string;
  current_queue: number;
  prebooked_tokens: number;
  checked_in_farmers: number;
  currently_processing: number;
  expected_next_hour: number;
  predicted_wait_mins: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  processing_rate_per_hour: number;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: Role;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
