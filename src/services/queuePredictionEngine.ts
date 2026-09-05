import { QueuePrediction, Booking } from '@/types';

/**
 * Queue Prediction Engine
 * 
 * Mathematical waiting time forecast model based on:
 * - Current checked-in queue
 * - Pre-booked tokens for the current slot window
 * - Rolling average processing time per vehicle (default 4.5 mins)
 * - Historical no-show rate adjustment (default ~5%)
 * - Weighbridge & moisture assay throughput
 */
export function calculateQueuePrediction(
  centreId: string,
  bookings: Booking[],
  averageProcessingTimeMins: number = 4.5,
  noShowRatePercent: number = 5
): QueuePrediction {
  const centreBookings = bookings.filter((b) => b.centre_id === centreId);

  const checkedIn = centreBookings.filter(
    (b) => b.status === 'CHECKED_IN' || b.status === 'WAITING'
  ).length;

  const currentlyProcessing = centreBookings.filter(
    (b) => b.status === 'QUALITY_TESTING' || b.status === 'WEIGHMENT'
  ).length;

  const prebooked = centreBookings.filter(
    (b) => b.status === 'BOOKED'
  ).length;

  // Expected arrivals in the immediate hour adjusted for no-show probability
  const expectedArrivals = Math.round(prebooked * (1 - noShowRatePercent / 100));

  // Total active workload
  const effectiveQueue = checkedIn + currentlyProcessing + Math.round(expectedArrivals * 0.4);

  // Predicted wait calculation in minutes
  const predictedWaitMins = Math.max(5, Math.round(effectiveQueue * averageProcessingTimeMins));

  // Processing rate per hour
  const processingRatePerHour = Math.round(60 / averageProcessingTimeMins);

  // Confidence tier
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  if (prebooked > 20) {
    confidence = 'MEDIUM';
  }
  if (centreBookings.length < 3) {
    confidence = 'LOW';
  }

  return {
    centre_id: centreId,
    current_queue: checkedIn + currentlyProcessing,
    prebooked_tokens: prebooked,
    checked_in_farmers: checkedIn,
    currently_processing: currentlyProcessing,
    expected_next_hour: expectedArrivals,
    predicted_wait_mins: predictedWaitMins,
    confidence,
    processing_rate_per_hour: processingRatePerHour,
  };
}
