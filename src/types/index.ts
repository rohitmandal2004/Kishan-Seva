export type Role = 'FARMER' | 'OPERATOR' | 'ADMIN' | 'CENTRE_MANAGER';

export interface User {
  id: string;
  role: Role;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  farmer_code: string;
  full_name: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  land_area_acres: number;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DEMO_VERIFIED';
}

export interface Crop {
  id: string;
  name: string;
  local_name: string;
  season: string;
  unit: string;
}

export interface FarmerCrop {
  id: string;
  farmer_id: string;
  crop_id: string;
  area_acres: number;
  expected_quantity: number;
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
  daily_capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
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
}

export interface Booking {
  id: string;
  booking_code: string;
  farmer_id: string;
  crop_id: string;
  centre_id: string;
  slot_id: string;
  expected_quantity: number;
  token_number: string;
  queue_sequence?: number;
  status: 'BOOKED' | 'CHECKED_IN' | 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  booked_at: string;
}
