import { supabase } from '@/lib/supabase';
import { mockStore, ProcurementCentre, BookingRecord, QualityData, WeighmentData } from './mockStore';

export const SupabaseDataService = {
  // Fetch Procurement Mandis
  getCentres: async (): Promise<ProcurementCentre[]> => {
    try {
      const { data, error } = await supabase
        .from('procurement_centres')
        .select('*')
        .order('distance_km', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockStore.getCentres();
      }

      return data.map((c: any) => ({
        id: c.id,
        centre_code: c.centre_code || 'KSP-001',
        name: c.name,
        address: c.address,
        state: c.state || 'West Bengal',
        district: c.district || 'North 24 Parganas',
        latitude: parseFloat(c.latitude) || 22.62,
        longitude: parseFloat(c.longitude) || 88.43,
        daily_capacity_quintals: parseFloat(c.daily_capacity_quintals) || 500,
        current_queue_length: parseInt(c.current_queue_length, 10) || 0,
        est_wait_time_mins: parseInt(c.est_wait_time_mins, 10) || 30,
        distance_km: parseFloat(c.distance_km) || 5.0,
        accepted_crops: c.accepted_crops || ['Paddy (Grade A)', 'Common Paddy'],
        status: c.status || 'ACTIVE',
        contact_number: c.contact_number || '+91 33 2568 1122'
      }));
    } catch {
      return mockStore.getCentres();
    }
  },

  // Toggle centre active/maintenance status
  toggleCentreStatus: async (centreId: string): Promise<void> => {
    try {
      const centre = mockStore.getCentreById(centreId);
      const newStatus = centre?.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
      
      mockStore.toggleCentreStatus(centreId);

      await supabase
        .from('procurement_centres')
        .update({ status: newStatus })
        .eq('id', centreId);
    } catch (e) {
      console.warn('Supabase toggle centre error:', e);
    }
  },

  // Fetch Bookings with QC & Weighment relations
  getBookings: async (): Promise<BookingRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          quality_checks (*),
          weighments (*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockStore.getBookings();
      }

      return data.map((b: any) => {
        const qc = Array.isArray(b.quality_checks) ? b.quality_checks[0] : b.quality_checks;
        const wm = Array.isArray(b.weighments) ? b.weighments[0] : b.weighments;

        return {
          id: b.id,
          token_number: b.token_number,
          farmer_id: b.farmer_id || 'farmer-1',
          farmer_name: b.farmer_name,
          farmer_phone: b.farmer_phone,
          centre_id: b.centre_id,
          centre_name: b.centre_name,
          crop_name: b.crop_name,
          expected_quantity_q: parseFloat(b.expected_quantity_q) || 45,
          slot_date: b.slot_date,
          slot_time: b.slot_time,
          vehicle_number: b.vehicle_number || 'WB 25 B 4821',
          vehicle_type: b.vehicle_type || 'Tractor Trolley',
          status: b.status || 'BOOKED',
          created_at: b.created_at || new Date().toISOString(),
          quality_data: qc ? {
            moisture_percent: parseFloat(qc.moisture_percent),
            foreign_matter_percent: parseFloat(qc.foreign_matter_percent || '1.0'),
            broken_grain_percent: parseFloat(qc.broken_grain_percent || '2.0'),
            grade: qc.grade || 'Grade A',
            inspector_name: qc.inspector_name || 'Subhasish Das',
            timestamp: qc.created_at,
            certificate_id: qc.certificate_id
          } : undefined,
          weighment_data: wm ? {
            gross_weight_q: parseFloat(wm.gross_weight_q),
            tare_weight_q: parseFloat(wm.tare_weight_q),
            net_weight_q: parseFloat(wm.net_weight_q),
            msp_rate_per_q: parseFloat(wm.msp_rate_per_q),
            gross_amount: parseFloat(wm.gross_amount),
            moisture_deduction: parseFloat(wm.moisture_deduction || '0'),
            handling_charge: parseFloat(wm.handling_charge || '450'),
            net_payable: parseFloat(wm.net_payable),
            slip_number: wm.slip_number,
            weighbridge_operator: wm.weighbridge_operator,
            timestamp: wm.created_at,
            dbt_status: wm.dbt_status || 'DISBURSED',
            transaction_ref: wm.transaction_ref
          } : undefined
        };
      });
    } catch {
      return mockStore.getBookings();
    }
  },

  // Create new procurement booking slot
  createBooking: async (params: {
    centre_id: string;
    crop_name: string;
    expected_quantity_q: number;
    slot_date: string;
    slot_time: string;
    vehicle_number?: string;
    vehicle_type?: string;
  }): Promise<BookingRecord> => {
    // 1. Always update local store immediately for instant snappy UI
    const localBooking = mockStore.createBooking(params);

    // 2. Persist to Supabase if connected
    try {
      const { data, error } = await supabase.from('bookings').insert({
        token_number: localBooking.token_number,
        farmer_name: localBooking.farmer_name,
        farmer_phone: localBooking.farmer_phone,
        centre_id: localBooking.centre_id,
        centre_name: localBooking.centre_name,
        crop_name: localBooking.crop_name,
        expected_quantity_q: localBooking.expected_quantity_q,
        slot_date: localBooking.slot_date,
        slot_time: localBooking.slot_time,
        vehicle_number: localBooking.vehicle_number,
        vehicle_type: localBooking.vehicle_type,
        status: 'BOOKED'
      }).select().single();

      if (!error && data) {
        // Increment queue length in Supabase centre table
        try {
          await supabase.rpc('increment_centre_queue', { c_id: params.centre_id });
        } catch {}
      }
    } catch (e) {
      console.warn('Supabase booking sync error:', e);
    }

    return localBooking;
  },

  // Update Booking Status & QC / Weighment Data
  updateBookingStatus: async (
    bookingId: string,
    status: BookingRecord['status'],
    qualityData?: QualityData,
    weighmentData?: WeighmentData
  ): Promise<void> => {
    // Update local state
    mockStore.updateBookingStatus(bookingId, status, qualityData, weighmentData);

    try {
      // Update booking status in Supabase
      await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      // Insert Quality Check if provided
      if (qualityData) {
        try {
          await supabase.from('quality_checks').upsert({
            booking_id: bookingId,
            moisture_percent: qualityData.moisture_percent,
            foreign_matter_percent: qualityData.foreign_matter_percent,
            broken_grain_percent: qualityData.broken_grain_percent,
            grade: qualityData.grade,
            inspector_name: qualityData.inspector_name,
            certificate_id: qualityData.certificate_id
          }, { onConflict: 'booking_id' });
        } catch {}
      }

      // Insert Weighment if provided
      if (weighmentData) {
        try {
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
          }, { onConflict: 'booking_id' });
        } catch {}
      }
    } catch (e) {
      console.warn('Supabase update status error:', e);
    }
  },

  // Advance booking in queue
  advanceBooking: async (bookingId: string): Promise<BookingRecord | undefined> => {
    const updated = mockStore.advanceBooking(bookingId);
    if (updated) {
      SupabaseDataService.updateBookingStatus(
        bookingId,
        updated.status,
        updated.quality_data,
        updated.weighment_data
      ).catch(() => {});
    }
    return updated;
  },

  // Setup Realtime Subscription
  subscribeRealtime: (onUpdate: () => void) => {
    try {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => {
            onUpdate();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'procurement_centres' },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }
};
