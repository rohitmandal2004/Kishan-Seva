/**
 * Kishan Seva Centralized Reactive State & Persistent Data Engine
 * All data stored in localStorage — no external backend required.
 * Supports multi-farmer profiles, role-based sessions, and real data flows.
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

export type UserRole = 'FARMER' | 'OPERATOR' | 'ADMIN' | null;

export interface SessionInfo {
  role: UserRole;
  phone?: string;
  farmerId?: string;
  operatorId?: string;
  adminId?: string;
  isLoggedIn: boolean;
}

// --- Static Reference Data ---

export const OFFICIAL_MSP_RATES: MSPRate[] = [
  { crop: 'Paddy (Grade A)', crop_hi: '\u0927\u093E\u0928 (\u0917\u094D\u0930\u0947\u0921 \u090F)', season: 'Kharif 2026', rate_per_quintal: 2183, prev_rate: 2060, change_percent: 5.97 },
  { crop: 'Common Paddy', crop_hi: '\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0927\u093E\u0928', season: 'Kharif 2026', rate_per_quintal: 2163, prev_rate: 2040, change_percent: 6.03 },
  { crop: 'Wheat', crop_hi: '\u0917\u0947\u0939\u0942\u0902', season: 'Rabi 2026', rate_per_quintal: 2275, prev_rate: 2125, change_percent: 7.06 },
  { crop: 'Mustard', crop_hi: '\u0938\u0930\u0938\u094B\u0902', season: 'Rabi 2026', rate_per_quintal: 5650, prev_rate: 5450, change_percent: 3.67 },
  { crop: 'Maize', crop_hi: '\u092E\u0915\u094D\u0915\u093E', season: 'Kharif 2026', rate_per_quintal: 2090, prev_rate: 1962, change_percent: 6.52 },
  { crop: 'Gram (Chana)', crop_hi: '\u091A\u0928\u093E', season: 'Rabi 2026', rate_per_quintal: 5440, prev_rate: 5335, change_percent: 1.97 },
];

// Infrastructure seed data
const SEED_CENTRES: ProcurementCentre[] = [
  {
    id: 'centre-1', centre_code: 'KSP-001', name: 'Krishnapur Procurement Centre',
    address: 'Krishnapur Main Road, Near Gram Panchayat Office', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6231, longitude: 88.4357,
    daily_capacity_quintals: 500, current_queue_length: 0, est_wait_time_mins: 0,
    distance_km: 4.2, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Maize'],
    status: 'ACTIVE', contact_number: '+91 33 2568 1122',
  },
  {
    id: 'centre-2', centre_code: 'KSP-002', name: 'Rajarhat Krishi Mandi Complex',
    address: 'Rajarhat Chowmatha, Action Area II', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6152, longitude: 88.4651,
    daily_capacity_quintals: 800, current_queue_length: 0, est_wait_time_mins: 0,
    distance_km: 6.8, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 33 2590 4455',
  },
  {
    id: 'centre-3', centre_code: 'KSP-003', name: 'Barasat Govt. Central Procurement Yard',
    address: 'NH-12, Near Dakbungalow More', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.7231, longitude: 88.4812,
    daily_capacity_quintals: 1200, current_queue_length: 0, est_wait_time_mins: 0,
    distance_km: 12.5, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Wheat', 'Gram (Chana)'],
    status: 'ACTIVE', contact_number: '+91 33 2552 8901',
  },
  {
    id: 'centre-4', centre_code: 'KSP-004', name: 'Madhyamgram Krishi Kalyan Kendra',
    address: 'Madhyamgram Chowmatha, Sodepur Road', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.6987, longitude: 88.4521,
    daily_capacity_quintals: 600, current_queue_length: 0, est_wait_time_mins: 0,
    distance_km: 8.1, accepted_crops: ['Paddy (Grade A)', 'Mustard', 'Maize'],
    status: 'ACTIVE', contact_number: '+91 33 2538 6720',
  },
  {
    id: 'centre-5', centre_code: 'KSP-005', name: 'Habra Sub-Divisional Procurement Depot',
    address: 'Jessore Road, Near Habra Railway Yard', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 22.8402, longitude: 88.6321,
    daily_capacity_quintals: 750, current_queue_length: 0, est_wait_time_mins: 0,
    distance_km: 18.3, accepted_crops: ['Paddy (Grade A)', 'Common Paddy', 'Mustard', 'Jute'],
    status: 'ACTIVE', contact_number: '+91 32 1623 8899',
  },
  {
    id: 'centre-6', centre_code: 'KSP-006', name: 'Bongaon Border Agrico Cooperative Yard',
    address: 'Station Road, Bongaon North', state: 'West Bengal',
    district: 'North 24 Parganas', latitude: 23.0425, longitude: 88.8284,
    daily_capacity_quintals: 900, current_queue_length: 0, est_wait_time_mins: 0,
    distance_km: 34.0, accepted_crops: ['Paddy (Grade A)', 'Wheat', 'Maize', 'Mustard'],
    status: 'ACTIVE', contact_number: '+91 32 1525 1100',
  }
];

const EMPTY_FARMER: FarmerProfile = {
  id: '', user_id: '', farmer_code: '', full_name: '', phone: '',
  aadhaar_last4: '', state: '', district: '', village: '',
  land_area_acres: 0, bank_name: '', account_number_masked: '',
  ifsc_code: '', verification_status: 'PENDING',
};

const STORAGE_KEY = 'kishan_seva_store_v3';
const SESSION_KEY = 'kishan_seva_session';

interface StoreState {
  farmers: Record<string, FarmerProfile>;
  centres: ProcurementCentre[];
  bookings: BookingRecord[];
}

class AppStore {
  private state: StoreState;
  private session: SessionInfo;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    this.session = this.loadSession();

    // Listen for storage events to sync cross-tab data in real-time
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
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load store:', e);
    }
    return { farmers: {}, centres: [...SEED_CENTRES], bookings: [] };
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
  public getActiveRole(): UserRole { return this.session.role; }

  public loginAsFarmer(phone: string): { isNewUser: boolean } {
    const existing = this.state.farmers[phone];
    this.session = { role: 'FARMER', phone, farmerId: existing?.id || '', isLoggedIn: true };
    this.saveSession();
    return { isNewUser: !existing };
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

  // Compat alias
  public login(phone: string): boolean {
    this.loginAsFarmer(phone);
    return true;
  }

  // --- Farmer CRUD ---

  public getFarmer(): FarmerProfile {
    if (this.session.phone && this.state.farmers[this.session.phone]) {
      return this.state.farmers[this.session.phone];
    }
    return { ...EMPTY_FARMER, phone: this.session.phone || '' };
  }

  public getFarmerByPhone(phone: string): FarmerProfile | undefined {
    return this.state.farmers[phone];
  }

  public registerFarmer(data: Partial<FarmerProfile> & { phone: string }): FarmerProfile {
    const phone = data.phone;
    const id = `farmer-${Date.now()}`;
    const code = `KIS-FMR-${Math.floor(10000 + Math.random() * 90000)}`;
    const farmer: FarmerProfile = {
      id, user_id: id, farmer_code: code,
      full_name: data.full_name || '', phone,
      aadhaar_last4: data.aadhaar_last4 || '',
      state: data.state || '', district: data.district || '', village: data.village || '',
      land_area_acres: data.land_area_acres || 0,
      bank_name: data.bank_name || '', account_number_masked: data.account_number_masked || '',
      ifsc_code: data.ifsc_code || '', verification_status: 'VERIFIED',
    };
    this.state.farmers[phone] = farmer;
    this.session.farmerId = id;
    this.saveState();
    this.saveSession();
    return farmer;
  }

  public updateFarmer(data: Partial<FarmerProfile>): void {
    const phone = this.session.phone;
    if (phone && this.state.farmers[phone]) {
      this.state.farmers[phone] = { ...this.state.farmers[phone], ...data };
      this.saveState();
    }
  }

  // --- Centres ---

  public getCentres(district?: string, crop?: string): ProcurementCentre[] {
    const activeCounts: Record<string, number> = {};
    for (const b of this.state.bookings) {
      if (b.status !== 'COMPLETED' && b.status !== 'CANCELLED') {
        activeCounts[b.centre_id] = (activeCounts[b.centre_id] || 0) + 1;
      }
    }
    return this.state.centres
      .map(c => ({ ...c, current_queue_length: activeCounts[c.id] || 0, est_wait_time_mins: (activeCounts[c.id] || 0) * 15 }))
      .filter((c) => {
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
    if (centre) { centre.status = centre.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE'; this.saveState(); }
  }

  // --- Bookings & Queue ---

  public getBookings(): BookingRecord[] { return this.state.bookings; }

  public getFarmerBookings(farmerId?: string): BookingRecord[] {
    const id = farmerId || this.getFarmer().id;
    if (!id) return [];
    return this.state.bookings.filter((b) => b.farmer_id === id);
  }

  public getActiveFarmerBooking(): BookingRecord | undefined {
    const farmer = this.getFarmer();
    if (!farmer.id) return undefined;
    return this.state.bookings.find(
      (b) => b.farmer_id === farmer.id && b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
    );
  }

  public createBooking(params: {
    centre_id: string; crop_name: string; expected_quantity_q: number;
    slot_date: string; slot_time: string; vehicle_number?: string; vehicle_type?: string;
  }): BookingRecord {
    const farmer = this.getFarmer();
    const centre = this.getCentreById(params.centre_id) || this.state.centres[0];
    const token = `KSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`, token_number: token,
      farmer_id: farmer.id, farmer_name: farmer.full_name, farmer_phone: farmer.phone,
      centre_id: centre.id, centre_name: centre.name,
      crop_name: params.crop_name, expected_quantity_q: params.expected_quantity_q,
      slot_date: params.slot_date, slot_time: params.slot_time,
      vehicle_number: params.vehicle_number || '', vehicle_type: params.vehicle_type || 'Tractor Trolley',
      status: 'BOOKED', created_at: new Date().toISOString(),
    };
    this.state.bookings = [newBooking, ...this.state.bookings];
    this.saveState();
    return newBooking;
  }

  public updateBookingStatus(bookingId: string, status: BookingRecord['status'], qualityData?: QualityData, weighmentData?: WeighmentData): void {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = status;
      if (qualityData) booking.quality_data = qualityData;
      if (weighmentData) booking.weighment_data = weighmentData;
      this.saveState();
    }
  }

  public advanceBooking(bookingId: string): BookingRecord | undefined {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (!booking) return undefined;
    const flow: BookingRecord['status'][] = ['BOOKED', 'CHECKED_IN', 'QUALITY_TESTING', 'WEIGHMENT', 'COMPLETED'];
    const idx = flow.indexOf(booking.status);
    if (idx < flow.length - 1) {
      const next = flow[idx + 1];
      booking.status = next;
      if (next === 'QUALITY_TESTING' && !booking.quality_data) {
        booking.quality_data = {
          moisture_percent: +(12 + Math.random() * 3).toFixed(1),
          foreign_matter_percent: +(0.5 + Math.random() * 1.5).toFixed(1),
          broken_grain_percent: +(1.0 + Math.random() * 2).toFixed(1),
          grade: 'Grade A', inspector_name: 'Quality Inspector',
          timestamp: new Date().toISOString(),
          certificate_id: `QC-KSP-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }
      if (next === 'COMPLETED' && !booking.weighment_data) {
        const netQ = booking.expected_quantity_q;
        const grossQ = Number((netQ + 15 + Math.random() * 5).toFixed(1));
        const mspRate = OFFICIAL_MSP_RATES.find(m => m.crop === booking.crop_name)?.rate_per_quintal || 2183;
        const grossAmt = netQ * mspRate;
        const handling = Math.round(netQ * 10);
        booking.weighment_data = {
          gross_weight_q: grossQ, tare_weight_q: Number((grossQ - netQ).toFixed(1)),
          net_weight_q: netQ, msp_rate_per_q: mspRate, gross_amount: grossAmt,
          moisture_deduction: 0, handling_charge: handling, net_payable: grossAmt - handling,
          slip_number: `J-FORM-KSP-${Math.floor(1000 + Math.random() * 9000)}`,
          weighbridge_operator: 'Weighbridge Operator', timestamp: new Date().toISOString(),
          dbt_status: 'DISBURSED', transaction_ref: `DBT/RBI/${Date.now().toString().slice(-8)}`
        };
      }
      this.saveState();
    }
    return booking;
  }

  // --- Analytics ---

  public getStats() {
    const totalBookings = this.state.bookings.length;
    const completed = this.state.bookings.filter((b) => b.status === 'COMPLETED');
    const totalProcuredQuintals = completed.reduce((s, b) => s + (b.weighment_data?.net_weight_q || b.expected_quantity_q), 0);
    const totalDisbursedAmount = completed.reduce((s, b) => s + (b.weighment_data?.net_payable || 0), 0);
    const inQueueCount = this.state.bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
    return {
      totalBookings, completedBookings: completed.length, totalProcuredQuintals,
      totalDisbursedCrores: (totalDisbursedAmount / 10000000).toFixed(2),
      totalDisbursedAmount, inQueueCount,
      activeCentres: this.state.centres.filter((c) => c.status === 'ACTIVE').length,
      totalFarmers: Object.keys(this.state.farmers).length,
    };
  }

  public resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.state = { farmers: {}, centres: [...SEED_CENTRES], bookings: [] };
    this.session = { role: null, isLoggedIn: false };
    this.saveState();
    this.saveSession();
  }
}

export const mockStore = new AppStore();
