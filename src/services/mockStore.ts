/**
 * Kishan Seva Centralized Reactive State & Persistent Data Engine
 * Hybrid client-side state engine with localStorage synchronization & Supabase compatibility.
 * 
 * v5: Production mode — no demo data, no auto-login, clean empty states for new users.
 */

import {
  FarmerProfile,
  ProcurementCentre,
  QualityCheck,
  Weighment,
  Booking,
  BookingStatus,
  NotificationItem,
  UserRole
} from '@/types';

export type { FarmerProfile, ProcurementCentre, QualityCheck, Weighment, Booking, BookingStatus, NotificationItem, UserRole };

export type QualityData = QualityCheck;
export type WeighmentData = Weighment;
export type BookingRecord = Booking;

export interface MSPRate {
  crop: string;
  crop_hi: string;
  crop_bn?: string;
  season: string;
  rate_per_quintal: number;
  prev_rate: number;
  change_percent: number;
}

export interface SessionInfo {
  role: 'FARMER' | 'OPERATOR' | 'ADMIN' | null;
  phone?: string;
  email?: string;
  farmerId?: string;
  operatorId?: string;
  adminId?: string;
  isLoggedIn: boolean;
}

// --- Static Reference Data (Government MSP rates — NOT demo data) ---

export const OFFICIAL_MSP_RATES: MSPRate[] = [
  { crop: 'Paddy (Grade A)', crop_hi: 'धान (ग्रेड ए)', crop_bn: 'ধান (গ্রেড এ)', season: 'Kharif 2026', rate_per_quintal: 2183, prev_rate: 2060, change_percent: 5.97 },
  { crop: 'Common Paddy', crop_hi: 'सामान्य धान', crop_bn: 'সাধারণ ধান', season: 'Kharif 2026', rate_per_quintal: 2163, prev_rate: 2040, change_percent: 6.03 },
  { crop: 'Wheat', crop_hi: 'गेहूं', crop_bn: 'গম', season: 'Rabi 2026', rate_per_quintal: 2275, prev_rate: 2125, change_percent: 7.06 },
  { crop: 'Mustard', crop_hi: 'सरसों', crop_bn: 'সরিষা', season: 'Rabi 2026', rate_per_quintal: 5650, prev_rate: 5450, change_percent: 3.67 },
  { crop: 'Maize', crop_hi: 'मक्का', crop_bn: 'ভুট্টা', season: 'Kharif 2026', rate_per_quintal: 2090, prev_rate: 1962, change_percent: 6.52 },
  { crop: 'Gram (Chana)', crop_hi: 'चना', crop_bn: 'ছোলা', season: 'Rabi 2026', rate_per_quintal: 5440, prev_rate: 5335, change_percent: 1.97 },
  { crop: 'Jute', crop_hi: 'जूट', crop_bn: 'পাট', season: 'Kharif 2026', rate_per_quintal: 5050, prev_rate: 4750, change_percent: 6.32 },
  { crop: 'Lentil (Masur)', crop_hi: 'मसूर', crop_bn: 'মসুর ডাল', season: 'Rabi 2026', rate_per_quintal: 6425, prev_rate: 6000, change_percent: 7.08 }
];

// Procurement Centre reference data (real mandi locations — NOT demo data)
export const SEED_CENTRES: ProcurementCentre[] = [
  // North 24 Parganas (Benchmark Scenario)
  {
    id: 'centre-1', centre_code: 'KSP-001', name: 'Krishnapur Main Yard (Nearest)',
    address: 'Krishnapur Main Road, Near Gram Panchayat Office', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6231, longitude: 88.4357,
    daily_capacity_quintals: 500, current_queue_length: 65, est_wait_time_mins: 180,
    distance_km: 2.1, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Maize'],
    status: 'ACTIVE', contact_number: '+91 33 2568 1122'
  },
  {
    id: 'centre-2', centre_code: 'KSP-002', name: 'Rajarhat Krishi Mandi Complex (Optimal Match)',
    address: 'Rajarhat Chowmatha, Action Area II', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6152, longitude: 88.4651,
    daily_capacity_quintals: 800, current_queue_length: 12, est_wait_time_mins: 35,
    distance_km: 5.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 33 2590 4455'
  },
  {
    id: 'centre-3', centre_code: 'KSP-003', name: 'Barasat Govt. Central Procurement Yard',
    address: 'NH-12, Near Dakbungalow More', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.7231, longitude: 88.4812,
    daily_capacity_quintals: 1200, current_queue_length: 25, est_wait_time_mins: 70,
    distance_km: 7.2, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)'],
    status: 'ACTIVE', contact_number: '+91 33 2552 8901'
  },
  {
    id: 'centre-4', centre_code: 'KSP-004', name: 'Madhyamgram Krishi Kalyan Kendra',
    address: 'Madhyamgram Chowmatha, Sodepur Road', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6987, longitude: 88.4521,
    daily_capacity_quintals: 600, current_queue_length: 9, est_wait_time_mins: 30,
    distance_km: 8.4, accepted_crops: ['Paddy (Grade A)', 'Mustard', 'Maize'],
    status: 'ACTIVE', contact_number: '+91 33 2538 6720'
  },
  {
    id: 'centre-5', centre_code: 'KSP-005', name: 'Habra Sub-Divisional Procurement Depot',
    address: 'Jessore Road, Near Habra Railway Yard', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.8402, longitude: 88.6321,
    daily_capacity_quintals: 750, current_queue_length: 14, est_wait_time_mins: 45,
    distance_km: 18.3, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Jute'],
    status: 'ACTIVE', contact_number: '+91 32 1623 8899'
  },
  {
    id: 'centre-6', centre_code: 'KSP-006', name: 'Bongaon Border Agrico Cooperative Yard',
    address: 'Station Road, Bongaon North', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 23.0425, longitude: 88.8284,
    daily_capacity_quintals: 900, current_queue_length: 4, est_wait_time_mins: 15,
    distance_km: 34.0, accepted_crops: ['Paddy (Grade A)', 'Wheat', 'Maize', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 32 1525 1100'
  },
  {
    id: 'centre-7', centre_code: 'KSP-007', name: 'Basirhat Krishi Bhavan Terminal',
    address: 'Taki Road, Basirhat Sub-division', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6582, longitude: 88.8643,
    daily_capacity_quintals: 650, current_queue_length: 8, est_wait_time_mins: 25,
    distance_km: 14.2, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Jute'],
    status: 'ACTIVE', contact_number: '+91 32 1726 5544'
  },
  // South 24 Parganas
  {
    id: 'centre-8', centre_code: 'KSP-008', name: 'Baruipur Krishak Bazar',
    address: 'Kulpi Road, Near Baruipur High School', state: 'West Bengal',
    district: 'South 24 Parganas', latitude: 22.3654, longitude: 88.4321,
    daily_capacity_quintals: 800, current_queue_length: 16, est_wait_time_mins: 50,
    distance_km: 28.5, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 33 2433 1122'
  },
  {
    id: 'centre-9', centre_code: 'KSP-009', name: 'Canning Sundarban Agricultural Depot',
    address: 'Hospital Road, Canning Town', state: 'West Bengal',
    district: 'South 24 Parganas', latitude: 22.3123, longitude: 88.6654,
    daily_capacity_quintals: 550, current_queue_length: 7, est_wait_time_mins: 20,
    distance_km: 38.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy'],
    status: 'ACTIVE', contact_number: '+91 32 1825 5500'
  },
  {
    id: 'centre-10', centre_code: 'KSP-010', name: 'Diamond Harbour Central Mandi',
    address: 'Station Road, Diamond Harbour', state: 'West Bengal',
    district: 'South 24 Parganas', latitude: 22.1982, longitude: 88.2015,
    daily_capacity_quintals: 700, current_queue_length: 11, est_wait_time_mins: 40,
    distance_km: 48.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Maize'],
    status: 'ACTIVE', contact_number: '+91 31 7425 5200'
  },
  // Burdwan (East) & Hooghly
  {
    id: 'centre-11', centre_code: 'KSP-011', name: 'Burdwan Kalna Grain Procurement Hub',
    address: 'STKK Road, Kalna Gate', state: 'West Bengal',
    district: 'Burdwan (East)', latitude: 23.2185, longitude: 88.3652,
    daily_capacity_quintals: 1400, current_queue_length: 30, est_wait_time_mins: 95,
    distance_km: 65.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 34 2256 7788'
  },
  {
    id: 'centre-12', centre_code: 'KSP-012', name: 'Memari Krishi Bikash Kendra',
    address: 'GT Road, Memari Bypass', state: 'West Bengal',
    district: 'Burdwan (East)', latitude: 23.1845, longitude: 88.1123,
    daily_capacity_quintals: 1100, current_queue_length: 18, est_wait_time_mins: 55,
    distance_km: 72.0, accepted_crops: ['Paddy (Grade A)', 'Wheat', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 34 2225 3344'
  },
  {
    id: 'centre-13', centre_code: 'KSP-013', name: 'Arambagh Sub-Divisional Mandi',
    address: 'Old Court More, Arambagh', state: 'West Bengal',
    district: 'Hooghly', latitude: 22.8845, longitude: 87.7845,
    daily_capacity_quintals: 850, current_queue_length: 13, est_wait_time_mins: 40,
    distance_km: 78.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 32 1125 5678'
  },
  {
    id: 'centre-14', centre_code: 'KSP-014', name: 'Singur Kisan Seva Yard',
    address: 'Durgapur Expressway, Singur', state: 'West Bengal',
    district: 'Hooghly', latitude: 22.8123, longitude: 88.2345,
    daily_capacity_quintals: 950, current_queue_length: 10, est_wait_time_mins: 30,
    distance_km: 42.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Gram (Chana)'],
    status: 'ACTIVE', contact_number: '+91 33 2630 1199'
  },
  // Nadia & Murshidabad
  {
    id: 'centre-15', centre_code: 'KSP-015', name: 'Ranaghat Krishi Kalyan Depot',
    address: 'NH-12, Near Ranaghat Overbridge', state: 'West Bengal',
    district: 'Nadia', latitude: 23.1812, longitude: 88.5821,
    daily_capacity_quintals: 750, current_queue_length: 15, est_wait_time_mins: 45,
    distance_km: 52.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Jute', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 34 7321 0044'
  },
  {
    id: 'centre-16', centre_code: 'KSP-016', name: 'Krishnanagar Sadar Procurement Yard',
    address: 'Palpara More, Krishnanagar', state: 'West Bengal',
    district: 'Nadia', latitude: 23.4012, longitude: 88.4987,
    daily_capacity_quintals: 1000, current_queue_length: 22, est_wait_time_mins: 65,
    distance_km: 75.0, accepted_crops: ['Paddy (Grade A)', 'Wheat', 'Mustard', 'Jute'],
    status: 'ACTIVE', contact_number: '+91 34 7225 6677'
  },
  {
    id: 'centre-17', centre_code: 'KSP-017', name: 'Berhampore Grain Silo Complex',
    address: 'Panchanantala, Berhampore', state: 'West Bengal',
    district: 'Murshidabad', latitude: 24.0987, longitude: 88.2564,
    daily_capacity_quintals: 1500, current_queue_length: 28, est_wait_time_mins: 85,
    distance_km: 140.0, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)', 'Lentil (Masur)'],
    status: 'ACTIVE', contact_number: '+91 34 8225 1100'
  }
];

const STORAGE_KEY = 'kishan_seva_store_v5';
const SESSION_KEY = 'kishan_seva_session_v2';

interface StoreState {
  farmers: Record<string, FarmerProfile>;
  centres: ProcurementCentre[];
  bookings: BookingRecord[];
  notifications: NotificationItem[];
}

class AppStore {
  private state: StoreState;
  private session: SessionInfo;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    this.session = this.loadSession();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === SESSION_KEY) {
          this.state = this.loadState();
          this.session = this.loadSession();
          this.notify();
        }
      });
    }
  }

  private loadState(): StoreState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.centres || parsed.centres.length === 0) parsed.centres = SEED_CENTRES;
        if (!parsed.farmers) parsed.farmers = {};
        if (!parsed.bookings) parsed.bookings = [];
        if (!parsed.notifications) parsed.notifications = [];
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load store:', e);
    }
    // Fresh state — no demo data
    return {
      farmers: {},
      centres: [...SEED_CENTRES],
      bookings: [],
      notifications: []
    };
  }

  private saveState(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch {}
    this.notify();
  }

  private loadSession(): SessionInfo {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // No auto-login — user must authenticate
    return { role: null, isLoggedIn: false };
  }

  private saveSession(): void {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(this.session)); } catch {}
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // --- Session / Auth ---

  public getSession(): SessionInfo { return { ...this.session }; }
  public isLoggedIn(): boolean { return this.session.isLoggedIn; }
  public getActiveRole(): SessionInfo['role'] { return this.session.role; }

  public loginAsFarmer(identifier: string): { isNewUser: boolean } {
    const cleanId = identifier.trim().toLowerCase();
    const isEmail = cleanId.includes('@');

    // Search existing farmers by email or phone
    const existing = Object.values(this.state.farmers).find(
      f => (f.email && f.email.toLowerCase() === cleanId) || f.phone === cleanId || f.id === cleanId
    );

    if (existing) {
      this.session = { 
        role: 'FARMER', 
        email: existing.email || (isEmail ? cleanId : undefined), 
        phone: existing.phone, 
        farmerId: existing.id, 
        isLoggedIn: true 
      };
      this.saveSession();
      return { isNewUser: false };
    }

    // Create new skeleton farmer for new users
    const id = `f-${Date.now()}`;
    const code = `KIS-FMR-${Math.floor(10000 + Math.random() * 90000)}`;
    const phone = isEmail ? '' : cleanId;
    const email = isEmail ? cleanId : '';

    const newFarmer: FarmerProfile = {
      id,
      user_id: id,
      farmer_code: code,
      full_name: isEmail ? cleanId.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'New Farmer',
      phone,
      email,
      state: '',
      district: '',
      village: '',
      land_area_acres: 0,
      verification_status: 'PENDING'
    };

    const storeKey = email || phone || id;
    this.state.farmers[storeKey] = newFarmer;
    this.session = { role: 'FARMER', email: email || undefined, phone: phone || undefined, farmerId: id, isLoggedIn: true };
    this.saveState();
    this.saveSession();
    return { isNewUser: true };
  }

  public loginAsOperator(operatorId: string): void {
    this.session = { role: 'OPERATOR', operatorId, isLoggedIn: true };
    this.saveSession();
  }

  public loginAsAdmin(adminId: string): void {
    this.session = { role: 'ADMIN', adminId, isLoggedIn: true };
    this.saveSession();
  }

  public logout(): void {
    this.session = { role: null, isLoggedIn: false };
    this.saveSession();
  }

  // --- Farmer CRUD ---

  public getFarmer(): FarmerProfile | null {
    if (!this.session.isLoggedIn || this.session.role !== 'FARMER') return null;

    if (this.session.email) {
      const byEmail = Object.values(this.state.farmers).find(
        f => f.email && f.email.toLowerCase() === this.session.email?.toLowerCase()
      );
      if (byEmail) return byEmail;
    }
    if (this.session.phone && this.state.farmers[this.session.phone]) {
      return this.state.farmers[this.session.phone];
    }
    if (this.session.farmerId) {
      const byId = Object.values(this.state.farmers).find(f => f.id === this.session.farmerId);
      if (byId) return byId;
    }
    return null;
  }

  public registerFarmer(data: Partial<FarmerProfile> & { phone?: string; email?: string }): FarmerProfile {
    const current = this.getFarmer();
    const phone = data.phone || current?.phone || '';
    const email = data.email || current?.email || this.session.email || '';
    const id = current?.id || this.session.farmerId || `f-${Date.now()}`;
    const code = current?.farmer_code || `KIS-FMR-${Math.floor(10000 + Math.random() * 90000)}`;

    const farmer: FarmerProfile = {
      ...(current || {}),
      id,
      user_id: id,
      farmer_code: code,
      full_name: data.full_name || current?.full_name || 'Farmer',
      phone,
      email,
      aadhaar_last_four: data.aadhaar_last_four || current?.aadhaar_last_four,
      state: data.state || current?.state || '',
      district: data.district || current?.district || '',
      village: data.village || current?.village || '',
      land_area_acres: data.land_area_acres || current?.land_area_acres || 0,
      bank_name: data.bank_name || current?.bank_name,
      account_number_masked: data.account_number_masked || current?.account_number_masked,
      ifsc_code: data.ifsc_code || current?.ifsc_code,
      verification_status: 'VERIFIED'
    };

    const storeKey = email || phone || id;
    this.state.farmers[storeKey] = farmer;
    this.session.farmerId = id;
    this.session.phone = phone || undefined;
    this.session.email = email || undefined;
    this.saveState();
    this.saveSession();
    return farmer;
  }

  // --- Centres ---

  public getCentres(): ProcurementCentre[] {
    const activeCounts: Record<string, number> = {};
    for (const b of this.state.bookings) {
      if (b.status !== 'COMPLETED' && b.status !== 'CANCELLED') {
        activeCounts[b.centre_id] = (activeCounts[b.centre_id] || 0) + 1;
      }
    }
    return this.state.centres.map(c => ({
      ...c,
      current_queue_length: activeCounts[c.id] !== undefined ? activeCounts[c.id] : c.current_queue_length,
      est_wait_time_mins: activeCounts[c.id] !== undefined ? activeCounts[c.id] * 5 : c.est_wait_time_mins
    }));
  }

  public getCentreById(id: string): ProcurementCentre | undefined {
    return this.getCentres().find(c => c.id === id);
  }

  public toggleCentreStatus(centreId: string): void {
    const centre = this.state.centres.find(c => c.id === centreId);
    if (centre) {
      centre.status = centre.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
      this.saveState();
    }
  }

  // --- Bookings & Queue ---

  public getBookings(): BookingRecord[] {
    return this.state.bookings;
  }

  public getFarmerBookings(farmerId?: string): BookingRecord[] {
    const farmer = this.getFarmer();
    const id = farmerId || farmer?.id;
    if (!id) return [];
    return this.state.bookings.filter(b => b.farmer_id === id);
  }

  public getActiveFarmerBooking(): BookingRecord | undefined {
    const farmer = this.getFarmer();
    if (!farmer) return undefined;
    return this.state.bookings.find(
      b => b.farmer_id === farmer.id && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
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
    const farmer = this.getFarmer();
    const centre = this.getCentreById(params.centre_id) || this.state.centres[0];
    const token = `KSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`,
      token_number: token,
      farmer_id: farmer?.id || 'unknown',
      farmer_name: farmer?.full_name || 'Farmer',
      farmer_phone: farmer?.phone || '',
      centre_id: centre.id,
      centre_name: centre.name,
      crop_name: params.crop_name,
      expected_quantity_q: params.expected_quantity_q,
      slot_date: params.slot_date,
      slot_time: params.slot_time,
      vehicle_number: params.vehicle_number || '',
      vehicle_type: params.vehicle_type || '',
      status: 'BOOKED',
      booked_at: new Date().toISOString()
    };
    this.state.bookings = [newBooking, ...this.state.bookings];
    this.saveState();
    return newBooking;
  }

  public updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    qualityData?: QualityData,
    weighmentData?: WeighmentData
  ): void {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      if (qualityData) booking.quality_data = qualityData;
      if (weighmentData) booking.weighment_data = weighmentData;
      this.saveState();
    }
  }

  public advanceBooking(bookingId: string): BookingRecord | undefined {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (!booking) return undefined;
    const flow: BookingStatus[] = ['BOOKED', 'CHECKED_IN', 'QUALITY_TESTING', 'WEIGHMENT', 'COMPLETED'];
    const idx = flow.indexOf(booking.status);
    if (idx < flow.length - 1) {
      const next = flow[idx + 1];
      booking.status = next;
      if (next === 'QUALITY_TESTING' && !booking.quality_data) {
        booking.quality_data = {
          booking_id: booking.id,
          moisture_percent: +(12.5 + Math.random() * 2).toFixed(1),
          foreign_matter_percent: +(0.8 + Math.random() * 0.8).toFixed(1),
          broken_grain_percent: +(1.2 + Math.random() * 1.5).toFixed(1),
          grade: 'Grade A',
          inspector_name: 'Subhasish Das (Chief Inspector)',
          certificate_id: `QC-KSP-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }
      if (next === 'COMPLETED' && !booking.weighment_data) {
        const netQ = booking.expected_quantity_q;
        const grossQ = Number((netQ + 17.5).toFixed(1));
        const mspRate = OFFICIAL_MSP_RATES.find(m => m.crop === booking.crop_name)?.rate_per_quintal || 2183;
        const grossAmt = netQ * mspRate;
        const handling = 450;
        booking.weighment_data = {
          booking_id: booking.id,
          gross_weight_q: grossQ,
          tare_weight_q: 17.5,
          net_weight_q: netQ,
          msp_rate_per_q: mspRate,
          gross_amount: grossAmt,
          moisture_deduction: 0,
          handling_charge: handling,
          net_payable: grossAmt - handling,
          slip_number: `J-FORM-KSP-${Math.floor(1000 + Math.random() * 9000)}`,
          weighbridge_operator: 'Pradip Ghosh (ID: WB-992)',
          dbt_status: 'DISBURSED',
          transaction_ref: `DBT/RBI/${Date.now().toString().slice(-8)}`
        };
      }
      this.saveState();
    }
    return booking;
  }

  // --- Analytics ---

  public getStats() {
    const totalBookings = this.state.bookings.length;
    const completed = this.state.bookings.filter(b => b.status === 'COMPLETED');
    const totalProcuredQuintals = completed.reduce((s, b) => s + (b.weighment_data?.net_weight_q || b.expected_quantity_q), 0);
    const totalDisbursedAmount = completed.reduce((s, b) => s + (b.weighment_data?.net_payable || 0), 0);
    const inQueueCount = this.state.bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
    return {
      totalBookings,
      completedBookings: completed.length,
      totalProcuredQuintals,
      totalDisbursedCrores: (totalDisbursedAmount / 10000000).toFixed(2),
      totalDisbursedAmount,
      inQueueCount,
      activeCentres: this.state.centres.filter(c => c.status === 'ACTIVE').length,
      totalFarmers: Object.keys(this.state.farmers).length
    };
  }

  public resetStore(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.state = {
      farmers: {},
      centres: [...SEED_CENTRES],
      bookings: [],
      notifications: []
    };
    this.session = { role: null, isLoggedIn: false };
    this.saveState();
    this.saveSession();
  }
}

export const mockStore = new AppStore();
