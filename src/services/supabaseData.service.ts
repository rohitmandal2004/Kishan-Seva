import { mockStore, ProcurementCentre, BookingRecord, QualityData, WeighmentData } from './mockStore';

/**
 * Data Service — delegates all operations to the localStorage-backed AppStore.
 * Maintains the same API surface so pages don't need changes.
 */
export const SupabaseDataService = {
  // Fetch Procurement Mandis
  getCentres: async (): Promise<ProcurementCentre[]> => {
    return mockStore.getCentres();
  },

  // Toggle centre active/maintenance status
  toggleCentreStatus: async (centreId: string): Promise<void> => {
    mockStore.toggleCentreStatus(centreId);
  },

  // Fetch all Bookings
  getBookings: async (): Promise<BookingRecord[]> => {
    return mockStore.getBookings();
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
    return mockStore.createBooking(params);
  },

  // Update Booking Status & QC / Weighment Data
  updateBookingStatus: async (
    bookingId: string,
    status: BookingRecord['status'],
    qualityData?: QualityData,
    weighmentData?: WeighmentData
  ): Promise<void> => {
    mockStore.updateBookingStatus(bookingId, status, qualityData, weighmentData);
  },

  // Advance booking in queue
  advanceBooking: async (bookingId: string): Promise<BookingRecord | undefined> => {
    return mockStore.advanceBooking(bookingId);
  },

  // Realtime subscription (no-op since we use localStorage + React state)
  subscribeRealtime: (_onUpdate: () => void) => {
    // localStorage store uses its own subscription mechanism via useMockStore hook
    return () => {};
  }
};
