import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockStore } from './mockStore';
import { ProcurementCentre, Booking, QualityCheck, Weighment, BookingStatus, QueuePrediction } from '@/types';

/**
 * Kishan Seva Data Service — v2 (Optimized Backend)
 *
 * Architecture:
 *   1. Database-first: All heavy logic (geo-spatial, queue aggregation,
 *      atomic transactions) is executed server-side via Supabase RPCs/Views.
 *   2. Client fallback: When Supabase is not configured or VITE_ENABLE_DEMO_DATA
 *      is enabled, the mockStore provides local data.
 *   3. Scoped real-time: Subscriptions are filtered by role (farmer_id / centre_id)
 *      to minimize bandwidth and enforce security.
 */
const isDemoDataEnabled = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true';

export const SupabaseDataService = {
  // ─── Procurement Centres ─────────────────────────────────────────────

  /** Fetch all active procurement centres. */
  getCentres: async (): Promise<ProcurementCentre[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('procurement_centres')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as ProcurementCentre[];
        }
      } catch (err) {
        console.warn('Supabase getCentres error:', err);
      }
    }
    return isDemoDataEnabled ? mockStore.getCentres() : [];
  },

  /**
   * PostGIS-powered nearest centre lookup.
   * Executes entirely on the database — returns only the top N results
   * with pre-calculated distance_km and travel_time_mins.
   * Falls back to client-side mockStore if Supabase is unavailable.
   */
  findNearestCentres: async (
    lat: number,
    lon: number,
    cropName?: string,
    limit: number = 10
  ): Promise<(ProcurementCentre & { distance_km: number; travel_time_mins: number })[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('find_nearest_centres', {
          p_lat: lat,
          p_lon: lon,
          p_crop_name: cropName || null,
          p_limit: limit,
        });
        if (!error && data) {
          return data as (ProcurementCentre & { distance_km: number; travel_time_mins: number })[];
        }
      } catch (err) {
        console.warn('Supabase findNearestCentres RPC error, falling back to client-side:', err);
      }
    }
    // Fallback: return all centres from mockStore (client will score them)
    return isDemoDataEnabled
      ? mockStore.getCentres().map(c => ({ ...c, travel_time_mins: Math.round((c.distance_km || 5) / 25 * 60) }))
      : [];
  },

  /** Toggle centre active/maintenance status. */
  toggleCentreStatus: async (centreId: string): Promise<void> => {
    if (isDemoDataEnabled) mockStore.toggleCentreStatus(centreId);

    if (isSupabaseConfigured()) {
      try {
        const centre = mockStore.getCentreById(centreId);
        if (centre) {
          await supabase
            .from('procurement_centres')
            .update({ status: centre.status, updated_at: new Date().toISOString() })
            .eq('id', centreId);
        }
      } catch (err) {
        console.warn('Supabase toggleCentreStatus error:', err);
      }
    }
  },

  // ─── Bookings ────────────────────────────────────────────────────────

  /** Fetch all bookings (with joined quality checks & weighments). */
  getBookings: async (): Promise<Booking[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, quality_checks(*), weighments(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          mockStore.syncBookings(data as Booking[]);
          return data as Booking[];
        }
      } catch (err) {
        console.warn('Supabase getBookings error:', err);
      }
    }
    return isDemoDataEnabled ? mockStore.getBookings() : [];
  },

  /** Create a new procurement booking slot atomically via RPC. */
  createBooking: async (params: {
    farmer_id?: string;
    farmer_name?: string;
    farmer_phone?: string;
    farmer_email?: string;
    farmer_code?: string;
    clerk_user_id?: string;
    centre_id: string;
    crop_name: string;
    expected_quantity_q: number;
    slot_date: string;
    slot_time: string;
    vehicle_number?: string;
    vehicle_type?: string;
  }): Promise<Booking> => {
    let localBooking: Booking | null = null;
    if (isDemoDataEnabled) {
      localBooking = mockStore.createBooking({
        ...params,
        farmerId: params.farmer_id || 'unknown',
        farmerName: params.farmer_name || 'Farmer',
        farmerPhone: params.farmer_phone || '',
        farmerEmail: params.farmer_email,
        farmerCode: params.farmer_code,
        clerkUserId: params.clerk_user_id,
      });
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('create_booking', {
          p_farmer_id: params.farmer_id || 'unknown',
          p_centre_id: params.centre_id,
          p_crop_name: params.crop_name,
          p_expected_quantity: params.expected_quantity_q,
          p_slot_date: params.slot_date,
          p_slot_time: params.slot_time,
          p_vehicle_number: params.vehicle_number || '',
          p_vehicle_type: params.vehicle_type || '',
        });
        if (!error && data) {
          if (isDemoDataEnabled) mockStore.syncBookings([data as Booking]);
          return data as Booking;
        }
      } catch (err) {
        console.warn('Supabase create_booking RPC error:', err);
        if (!isDemoDataEnabled) throw err;
      }
    }

    if (isDemoDataEnabled && localBooking) {
      return localBooking;
    }

    throw new Error('Database is not configured and demo data is disabled.');
  },

  // ─── Atomic Transaction RPCs ─────────────────────────────────────────

  /**
   * Atomic status update with optional quality check + weighment data.
   *
   * On Supabase: Calls the `submit_weighment_transaction` RPC which executes
   * a single database transaction — if any step (booking status update,
   * QC upsert, weighment upsert) fails, ALL changes are rolled back.
   *
   * On demo mode: Falls back to sequential mockStore mutations.
   */
  updateBookingStatus: async (
    bookingId: string,
    status: BookingStatus,
    qualityData?: QualityCheck,
    weighmentData?: Weighment
  ): Promise<void> => {
    if (isDemoDataEnabled) {
      mockStore.updateBookingStatus(bookingId, status, qualityData, weighmentData);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.rpc('submit_weighment_transaction', {
          p_booking_id: bookingId,
          p_status: status,
          // Quality check fields
          p_moisture_percent: qualityData?.moisture_percent ?? null,
          p_foreign_matter_percent: qualityData?.foreign_matter_percent ?? null,
          p_broken_grain_percent: qualityData?.broken_grain_percent ?? null,
          p_grade: qualityData?.grade ?? null,
          p_inspector_name: qualityData?.inspector_name ?? null,
          p_certificate_id: qualityData?.certificate_id ?? null,
          // Weighment fields
          p_gross_weight_q: weighmentData?.gross_weight_q ?? null,
          p_tare_weight_q: weighmentData?.tare_weight_q ?? null,
          p_net_weight_q: weighmentData?.net_weight_q ?? null,
          p_msp_rate_per_q: weighmentData?.msp_rate_per_q ?? null,
          p_gross_amount: weighmentData?.gross_amount ?? null,
          p_moisture_deduction: weighmentData?.moisture_deduction ?? null,
          p_handling_charge: weighmentData?.handling_charge ?? null,
          p_net_payable: weighmentData?.net_payable ?? null,
          p_slip_number: weighmentData?.slip_number ?? null,
          p_weighbridge_operator: weighmentData?.weighbridge_operator ?? null,
          p_dbt_status: weighmentData?.dbt_status ?? null,
          p_transaction_ref: weighmentData?.transaction_ref ?? null,
        });

        if (error) {
          console.error('Atomic weighment transaction failed:', error);
          throw error;
        }
      } catch (err) {
        console.warn('Supabase submit_weighment_transaction error:', err);
        if (!isDemoDataEnabled) throw err;
      }
    }
  },

  // ─── Queue Prediction (Server-side) ──────────────────────────────────

  /**
   * Fetch queue prediction from the database view/RPC.
   * The database aggregates booking statuses and calculates predicted wait
   * time — the client receives only a small summary object.
   */
  getQueuePrediction: async (centreId: string): Promise<QueuePrediction | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('get_queue_prediction', {
          p_centre_id: centreId,
        });
        if (!error && data && data.length > 0) {
          return data[0] as QueuePrediction;
        }
      } catch (err) {
        console.warn('Supabase getQueuePrediction RPC error:', err);
      }
    }
    return null; // Caller should fall back to client-side calculation
  },

  /** Advance booking in the queue state machine. */
  advanceBooking: async (bookingId: string): Promise<Booking | undefined> => {
    let updated: Booking | undefined = undefined;
    if (isDemoDataEnabled) {
      updated = mockStore.advanceBooking(bookingId);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('advance_booking_state', { p_booking_id: bookingId });
      } catch (err) {
        console.warn('Supabase advance_booking_state error:', err);
      }
    }
    return updated;
  },

  // ─── Scoped Real-time Subscriptions ──────────────────────────────────

  /**
   * Subscribe to real-time booking changes scoped by role:
   * - Farmers: Only receive updates for their own farmer_id
   * - Operators: Only receive updates for their centre_id
   * - Admins: Receive all booking updates (unfiltered)
   *
   * This replaces the old broad `public-db-changes` channel.
   */
  subscribeRealtime: (
    onUpdate: () => void,
    scope?: { farmerId?: string; centreId?: string; role?: 'FARMER' | 'OPERATOR' | 'ADMIN' }
  ) => {
    if (isSupabaseConfigured()) {
      try {
        const channelName = scope?.farmerId
          ? `bookings-farmer-${scope.farmerId}`
          : scope?.centreId
            ? `bookings-centre-${scope.centreId}`
            : 'bookings-all';

        // Build the filter based on role/scope
        const bookingFilter: Record<string, string> =
          scope?.farmerId
            ? { event: '*', schema: 'public', table: 'bookings', filter: `farmer_id=eq.${scope.farmerId}` }
            : scope?.centreId
              ? { event: '*', schema: 'public', table: 'bookings', filter: `centre_id=eq.${scope.centreId}` }
              : { event: '*', schema: 'public', table: 'bookings' };

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            bookingFilter as any,
            () => onUpdate()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'procurement_centres' },
            () => onUpdate()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Supabase realtime subscription fallback:', err);
      }
    }
    return () => {};
  },
};
