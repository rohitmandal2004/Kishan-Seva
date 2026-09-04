/**
 * Kishan Seva Centralized Reactive State & Mock Data Engine
 * Synchronizes farmer bookings, live queue states, quality checks,
 * weighment receipts, and admin state-level analytics with localStorage persistence.
 */

export interface FarmerProfile {
  id: string;
  user_id: string;
  farmer_code: string;
  full_name: string;
  phone: string;
  aadhaar_last4: string;
  state: string;
  district: string;
  village: string;
  land_area_acres: number;
  bank_name: string;
  account_number_masked: string;
  ifsc_code: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'REJECTED';
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
  distance_km: number;
  accepted_crops: string[];
  status: 'ACTIVE' | 'MAINTENANCE';
  contact_number: string;
}

export interface QualityData {
  moisture_percent: number;
  foreign_matter_percent: number;
  broken_grain_percent: number;
  grade: 'Grade A' | 'Common' | 'Rejected';
  inspector_name: string;
  timestamp: string;
  certificate_id: string;
}

export interface WeighmentData {
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
  timestamp: string;
  dbt_status: 'QUEUED' | 'PROCESSED' | 'DISBURSED';
  transaction_ref: string;
}

export interface BookingRecord {
  id: string;
  token_number: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  centre_id: string;
  centre_name: string;
  crop_name: string;
  expected_quantity_q: number;
  slot_date: string;
  slot_time: string;
  vehicle_number: string;
  vehicle_type: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'QUALITY_TESTING' | 'WEIGHMENT' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  quality_data?: QualityData;
  weighment_data?: WeighmentData;
}

export interface MSPRate {
  crop: string;
  crop_hi: string;
  season: string;
  rate_per_quintal: number;
  prev_rate: number;
  change_percent: number;
}

export const OFFICIAL_MSP_RATES: MSPRate[] = [
  { crop: 'Paddy (Grade A)', crop_hi: 'धान (ग्रेड ए)', season: 'Kharif 2026', rate_per_quintal: 2183, prev_rate: 2060, change_percent: 5.97 },
  { crop: 'Common Paddy', crop_hi: 'सामान्य धान', season: 'Kharif 2026', rate_per_quintal: 2163, prev_rate: 2040, change_percent: 6.03 },
  { crop: 'Wheat', crop_hi: 'गेहूं', season: 'Rabi 2026', rate_per_quintal: 2275, prev_rate: 2125, change_percent: 7.06 },
  { crop: 'Mustard', crop_hi: 'सरसों', season: 'Rabi 2026', rate_per_quintal: 5650, prev_rate: 5450, change_percent: 3.67 },
  { crop: 'Maize', crop_hi: 'मक्का', season: 'Kharif 2026', rate_per_quintal: 2090, prev_rate: 1962, change_percent: 6.52 },
  { crop: 'Gram (Chana)', crop_hi: 'चना', season: 'Rabi 2026', rate_per_quintal: 5440, prev_rate: 5335, change_percent: 1.97 },
];

const INITIAL_CENTRES: ProcurementCentre[] = [
  {
    id: 'centre-1',
    centre_code: 'KSP-001',
    name: 'Krishnapur Procurement Centre',
    address: 'Krishnapur Main Road, Near Gram Panchayat Office',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.6231,
    longitude: 88.4357,
    daily_capacity_quintals: 500,
    current_queue_length: 14,
    est_wait_time_mins: 45,
    distance_km: 4.2,
    accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Maize'],
    status: 'ACTIVE',
    contact_number: '+91 33 2568 1122',
  },
  {
    id: 'centre-2',
    centre_code: 'KSP-002',
    name: 'Rajarhat Krishi Mandi Complex',
    address: 'Rajarhat Chowmatha, Action Area II',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.6152,
    longitude: 88.4651,
    daily_capacity_quintals: 800,
    current_queue_length: 5,
    est_wait_time_mins: 20,
    distance_km: 6.8,
    accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'],
    status: 'ACTIVE',
    contact_number: '+91 33 2590 4455',
  },
  {
    id: 'centre-3',
    centre_code: 'KSP-003',
    name: 'Barasat Govt. Central Procurement Yard',
    address: 'NH-12, Near Dakbungalow More',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.7231,
    longitude: 88.4812,
    daily_capacity_quintals: 1200,
    current_queue_length: 22,
    est_wait_time_mins: 85,
    distance_km: 12.5,
    accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)'],
    status: 'ACTIVE',
    contact_number: '+91 33 2552 8901',
  },
  {
    id: 'centre-4',
    centre_code: 'KSP-004',
    name: 'Madhyamgram Krishi Kalyan Kendra',
    address: 'Madhyamgram Chowmatha, Sodepur Road',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.6987,
    longitude: 88.4521,
    daily_capacity_quintals: 600,
    current_queue_length: 9,
    est_wait_time_mins: 35,
    distance_km: 8.1,
    accepted_crops: ['Paddy (Grade A)', 'Mustard', 'Maize'],
    status: 'ACTIVE',
    contact_number: '+91 33 2538 6720',
  },
  {
    id: 'centre-5',
    centre_code: 'KSP-005',
    name: 'Habra Sub-Divisional Procurement Depot',
    address: 'Jessore Road, Near Habra Railway Yard',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.8402,
    longitude: 88.6321,
    daily_capacity_quintals: 750,
    current_queue_length: 12,
    est_wait_time_mins: 50,
    distance_km: 18.3,
    accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Jute'],
    status: 'ACTIVE',
    contact_number: '+91 32 1623 8899',
  },
  {
    id: 'centre-6',
    centre_code: 'KSP-006',
    name: 'Bongaon Border Agrico Cooperative Yard',
    address: 'Station Road, Bongaon North',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 23.0425,
    longitude: 88.8284,
    daily_capacity_quintals: 900,
    current_queue_length: 4,
    est_wait_time_mins: 15,
    distance_km: 34.0,
    accepted_crops: ['Paddy (Grade A)', 'Wheat', 'Maize', 'Mustard'],
    status: 'ACTIVE',
    contact_number: '+91 32 1525 1100',
  }
];

const INITIAL_FARMER: FarmerProfile = {
  id: 'farmer-1',
  user_id: 'user-1',
  farmer_code: 'KIS-FMR-00001',
  full_name: 'Rohit Mandal',
  phone: '9876543210',
  aadhaar_last4: '8842',
  state: 'West Bengal',
  district: 'North 24 Parganas',
  village: 'Basirhat',
  land_area_acres: 4.3,
  bank_name: 'State Bank of India',
  account_number_masked: 'XXXX-XXXX-4591',
  ifsc_code: 'SBIN0001245',
  verification_status: 'VERIFIED',
};

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk-1042',
    token_number: 'KSP-1042',
    farmer_id: 'farmer-1',
    farmer_name: 'Rohit Mandal',
    farmer_phone: '9876543210',
    centre_id: 'centre-1',
    centre_name: 'Krishnapur Procurement Centre',
    crop_name: 'Paddy (Grade A)',
    expected_quantity_q: 50,
    slot_date: new Date().toISOString().split('T')[0],
    slot_time: '10:00 AM - 11:00 AM',
    vehicle_number: 'WB 25 B 4821',
    vehicle_type: 'Tractor Trolley',
    status: 'QUALITY_TESTING',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    quality_data: {
      moisture_percent: 13.8,
      foreign_matter_percent: 1.2,
      broken_grain_percent: 2.1,
      grade: 'Grade A',
      inspector_name: 'Subhasish Das (Chief Quality Inspector)',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      certificate_id: 'QC-KSP-2026-0889'
    }
  },
  {
    id: 'bk-1043',
    token_number: 'KSP-1043',
    farmer_id: 'farmer-2',
    farmer_name: 'Anup Kumar Roy',
    farmer_phone: '9830112233',
    centre_id: 'centre-1',
    centre_name: 'Krishnapur Procurement Centre',
    crop_name: 'Common Paddy',
    expected_quantity_q: 35,
    slot_date: new Date().toISOString().split('T')[0],
    slot_time: '11:00 AM - 12:00 PM',
    vehicle_number: 'WB 25 C 1190',
    vehicle_type: 'Mini Truck',
    status: 'CHECKED_IN',
    created_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'bk-1044',
    token_number: 'KSP-1044',
    farmer_id: 'farmer-3',
    farmer_name: 'Bimal Mondal',
    farmer_phone: '9831998877',
    centre_id: 'centre-1',
    centre_name: 'Krishnapur Procurement Centre',
    crop_name: 'Paddy (Grade A)',
    expected_quantity_q: 60,
    slot_date: new Date().toISOString().split('T')[0],
    slot_time: '11:00 AM - 12:00 PM',
    vehicle_number: 'WB 26 A 9043',
    vehicle_type: 'Tractor Trolley',
    status: 'BOOKED',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'bk-1040',
    token_number: 'KSP-1040',
    farmer_id: 'farmer-1',
    farmer_name: 'Rohit Mandal',
    farmer_phone: '9876543210',
    centre_id: 'centre-1',
    centre_name: 'Krishnapur Procurement Centre',
    crop_name: 'Paddy (Grade A)',
    expected_quantity_q: 45,
    slot_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    slot_time: '09:00 AM - 10:00 AM',
    vehicle_number: 'WB 25 B 4821',
    vehicle_type: 'Tractor Trolley',
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 90000000).toISOString(),
    quality_data: {
      moisture_percent: 13.5,
      foreign_matter_percent: 0.9,
      broken_grain_percent: 1.8,
      grade: 'Grade A',
      inspector_name: 'Subhasish Das',
      timestamp: new Date(Date.now() - 85000000).toISOString(),
      certificate_id: 'QC-KSP-2026-0772'
    },
    weighment_data: {
      gross_weight_q: 62.4,
      tare_weight_q: 17.4,
      net_weight_q: 45.0,
      msp_rate_per_q: 2183,
      gross_amount: 98235,
      moisture_deduction: 0,
      handling_charge: 450,
      net_payable: 97785,
      slip_number: 'J-FORM-KSP-2026-0419',
      weighbridge_operator: 'Pradip Ghosh (ID: WB-992)',
      timestamp: new Date(Date.now() - 84000000).toISOString(),
      dbt_status: 'DISBURSED',
      transaction_ref: 'DBT/RBI/20260904/00918239'
    }
  }
];

const STORAGE_KEY = 'kishan_seva_store_v2';

interface StoreState {
  farmer: FarmerProfile;
  centres: ProcurementCentre[];
  bookings: BookingRecord[];
  isLoggedIn: boolean;
}

class MockStore {
  private state: StoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): StoreState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load Kishan Seva mock store from localStorage:', e);
    }

    return {
      farmer: INITIAL_FARMER,
      centres: INITIAL_CENTRES,
      bookings: INITIAL_BOOKINGS,
      isLoggedIn: true,
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // Farmer Methods
  public getFarmer(): FarmerProfile {
    return this.state.farmer;
  }

  public updateFarmer(data: Partial<FarmerProfile>): void {
    this.state.farmer = { ...this.state.farmer, ...data };
    this.saveToStorage();
  }

  public isLoggedIn(): boolean {
    return this.state.isLoggedIn;
  }

  public login(phone: string): boolean {
    this.state.isLoggedIn = true;
    this.state.farmer.phone = phone;
    this.saveToStorage();
    return true;
  }

  public logout(): void {
    this.state.isLoggedIn = false;
    this.saveToStorage();
  }

  // Centres
  public getCentres(district?: string, crop?: string): ProcurementCentre[] {
    return this.state.centres.filter((c) => {
      if (district && district !== 'All' && c.district !== district) return false;
      if (crop && crop !== 'All' && !c.accepted_crops.some((cr) => cr.toLowerCase().includes(crop.toLowerCase()))) return false;
      return true;
    });
  }

  public getCentreById(id: string): ProcurementCentre | undefined {
    return this.state.centres.find((c) => c.id === id);
  }

  public toggleCentreStatus(centreId: string): void {
    const centre = this.state.centres.find((c) => c.id === centreId);
    if (centre) {
      centre.status = centre.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
      this.saveToStorage();
    }
  }

  // Bookings & Queue
  public getBookings(): BookingRecord[] {
    return this.state.bookings;
  }

  public getFarmerBookings(farmerId: string = 'farmer-1'): BookingRecord[] {
    return this.state.bookings.filter((b) => b.farmer_id === farmerId);
  }

  public getActiveFarmerBooking(): BookingRecord | undefined {
    return this.state.bookings.find(
      (b) => b.farmer_id === this.state.farmer.id && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
    );
  }

  public createBooking(params: {
    centre_id: string;
    crop_name: string;
    expected_quantity_q: number;
    slot_date: string;
    slot_time: string;
    vehicle_number?: string;
    vehicle_type?: string;
  }): BookingRecord {
    const centre = this.getCentreById(params.centre_id) || this.state.centres[0];
    const randTokenNum = Math.floor(1045 + Math.random() * 900);
    const token = `KSP-${randTokenNum}`;

    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`,
      token_number: token,
      farmer_id: this.state.farmer.id,
      farmer_name: this.state.farmer.full_name,
      farmer_phone: this.state.farmer.phone,
      centre_id: centre.id,
      centre_name: centre.name,
      crop_name: params.crop_name,
      expected_quantity_q: params.expected_quantity_q,
      slot_date: params.slot_date,
      slot_time: params.slot_time,
      vehicle_number: params.vehicle_number || 'WB 25 B 4821',
      vehicle_type: params.vehicle_type || 'Tractor Trolley',
      status: 'BOOKED',
      created_at: new Date().toISOString(),
    };

    // Increment centre queue
    centre.current_queue_length += 1;

    this.state.bookings = [newBooking, ...this.state.bookings];
    this.saveToStorage();
    return newBooking;
  }

  public updateBookingStatus(
    bookingId: string,
    status: BookingRecord['status'],
    qualityData?: QualityData,
    weighmentData?: WeighmentData
  ): void {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = status;
      if (qualityData) booking.quality_data = qualityData;
      if (weighmentData) booking.weighment_data = weighmentData;
      this.saveToStorage();
    }
  }

  public advanceBooking(bookingId: string): BookingRecord | undefined {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (!booking) return undefined;

    const flow: BookingRecord['status'][] = [
      'BOOKED',
      'CHECKED_IN',
      'QUALITY_TESTING',
      'WEIGHMENT',
      'COMPLETED',
    ];
    const currentIndex = flow.indexOf(booking.status);
    if (currentIndex < flow.length - 1) {
      const nextStatus = flow[currentIndex + 1];
      booking.status = nextStatus;

      // If transitioning to quality testing, generate sample QC if missing
      if (nextStatus === 'QUALITY_TESTING' && !booking.quality_data) {
        booking.quality_data = {
          moisture_percent: 13.6,
          foreign_matter_percent: 1.1,
          broken_grain_percent: 2.0,
          grade: 'Grade A',
          inspector_name: 'Subhasish Das (Chief Inspector)',
          timestamp: new Date().toISOString(),
          certificate_id: `QC-KSP-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }

      // If transitioning to completed, generate weighment slip if missing
      if (nextStatus === 'COMPLETED' && !booking.weighment_data) {
        const netQ = booking.expected_quantity_q;
        const grossQ = Number((netQ + 17.5).toFixed(1));
        const rate = 2183;
        const grossAmt = netQ * rate;
        booking.weighment_data = {
          gross_weight_q: grossQ,
          tare_weight_q: 17.5,
          net_weight_q: netQ,
          msp_rate_per_q: rate,
          gross_amount: grossAmt,
          moisture_deduction: 0,
          handling_charge: 450,
          net_payable: grossAmt - 450,
          slip_number: `J-FORM-KSP-${Math.floor(1000 + Math.random() * 9000)}`,
          weighbridge_operator: 'Pradip Ghosh (ID: WB-992)',
          timestamp: new Date().toISOString(),
          dbt_status: 'DISBURSED',
          transaction_ref: `DBT/RBI/${Date.now().toString().slice(-8)}`
        };
      }

      this.saveToStorage();
    }
    return booking;
  }

  // Analytics & Stats
  public getStats() {
    const totalBookings = this.state.bookings.length;
    const completedBookings = this.state.bookings.filter((b) => b.status === 'COMPLETED');
    const totalProcuredQuintals = completedBookings.reduce(
      (sum, b) => sum + (b.weighment_data?.net_weight_q || b.expected_quantity_q),
      0
    );
    const totalDisbursedAmount = completedBookings.reduce(
      (sum, b) => sum + (b.weighment_data?.net_payable || 0),
      0
    );
    const inQueueCount = this.state.bookings.filter(
      (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
    ).length;

    return {
      totalBookings,
      completedBookings: completedBookings.length,
      totalProcuredQuintals: totalProcuredQuintals + 18450, // base historical + mock
      totalDisbursedCrores: ((totalDisbursedAmount + 40280000) / 10000000).toFixed(2),
      inQueueCount,
      activeCentres: this.state.centres.filter((c) => c.status === 'ACTIVE').length,
    };
  }

  public resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      farmer: INITIAL_FARMER,
      centres: INITIAL_CENTRES,
      bookings: INITIAL_BOOKINGS,
      isLoggedIn: true,
    };
    this.saveToStorage();
  }
}

export const mockStore = new MockStore();
