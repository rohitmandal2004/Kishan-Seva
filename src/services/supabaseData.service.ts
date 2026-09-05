import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockStore } from './mockStore';
import { ProcurementCentre, Booking, QualityCheck, Weighment, BookingStatus } from '@/types';

/**
 * Kishan Seva Data Service
 * Seamless dual-mode layer: executes live Supabase queries & Realtime channels when connected,
 * with complete offline/demo state persistence fallback.
 */
export const SupabaseDataService = {
  // Fetch Procurement Mandis
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
        console.warn('Supabase getCentres fallback to local store:', err);
      }
    }
    return mockStore.getCentres();
  },

  // Toggle centre active/maintenance status
  toggleCentreStatus: async (centreId: string): Promise<void> => {
    mockStore.toggleCentreStatus(centreId);
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

  // Fetch all Bookings
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
        console.warn('Supabase getBookings fallback to local store:', err);
      }
    }
    return mockStore.getBookings();
  },

  // Create new procurement booking slot atomically
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
    // For local fallback, mockStore needs farmerId
    const localBooking = mockStore.createBooking({
      ...params,
      farmerId: params.farmer_id || 'unknown',
      farmerName: params.farmer_name || 'Farmer',
      farmerPhone: params.farmer_phone || '',
      farmerEmail: params.farmer_email,
      farmerCode: params.farmer_code,
      clerkUserId: params.clerk_user_id,
    });

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
          p_vehicle_type: params.vehicle_type || ''
        });
        if (!error && data) {
          mockStore.syncBookings([data as Booking]);
          return data as Booking;
        }
      } catch (err) {
        console.warn('Supabase create_booking RPC fallback:', err);
      }
    }
    return localBooking;
  },

  // Update Booking Status & QC / Weighment Data
  updateBookingStatus: async (
    bookingId: string,
    status: BookingStatus,
    qualityData?: QualityCheck,
    weighmentData?: Weighment
  ): Promise<void> => {
    mockStore.updateBookingStatus(bookingId, status, qualityData, weighmentData);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('bookings')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', bookingId);

        if (qualityData) {
          await supabase.from('quality_checks').upsert({
            booking_id: bookingId,
            moisture_percent: qualityData.moisture_percent,
            foreign_matter_percent: qualityData.foreign_matter_percent,
            broken_grain_percent: qualityData.broken_grain_percent,
            grade: qualityData.grade,
            inspector_name: qualityData.inspector_name,
            certificate_id: qualityData.certificate_id
          });
        }

        if (weighmentData) {
          await supabase.from('weighments').upsert({
            booking_id: bookingId,
            gross_weight_q: weighmentData.gross_weight_q,
            tare_weight_q: weighmentData.tare_weight_q,
            net_weight_q: weighmentData.net_weight_q,
            msp_rate_per_q: weighmentData.msp_rate_per_q,
            gross_amount: weighmentData.gross_amount,
            moisture_deduction: weighmentData.moisture_deduction,
            handling_charge: weighmentData.handling_charge,
            net_payable: weighmentData.net_payable,
            slip_number: weighmentData.slip_number,
            weighbridge_operator: weighmentData.weighbridge_operator,
            dbt_status: weighmentData.dbt_status,
            transaction_ref: weighmentData.transaction_ref
          });
        }
      } catch (err) {
        console.warn('Supabase updateBookingStatus error:', err);
      }
    }
  },

  // Advance booking in queue state machine
  advanceBooking: async (bookingId: string): Promise<Booking | undefined> => {
    const updated = mockStore.advanceBooking(bookingId);
    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('advance_booking_state', { p_booking_id: bookingId });
      } catch (err) {
        console.warn('Supabase advance_booking_state error:', err);
      }
    }
    return updated;
  },

  // Realtime subscription via Supabase Channels
  subscribeRealtime: (onUpdate: () => void) => {
    if (isSupabaseConfigured()) {
      try {
        const channel = supabase
          .channel('public-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
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
  }
};
