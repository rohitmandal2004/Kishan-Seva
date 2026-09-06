import { QueuePrediction, Booking } from '@/types';
import { SupabaseDataService } from './supabaseData.service';

/**
 * Queue Prediction Engine — v2 (Database-first)
 *
 * Primary path: Calls the `get_queue_prediction` Supabase RPC which executes
 * a SQL view aggregation on the server. The client receives a tiny summary
 * object instead of downloading all booking rows.
 *
 * Fallback path: When Supabase is unavailable, performs the same calculation
 * client-side from locally cached bookings.
 */
export async function calculateQueuePredictionAsync(
  centreId: string,
  bookings: Booking[],
  averageProcessingTimeMins: number = 4.5,
  noShowRatePercent: number = 5
): Promise<QueuePrediction> {
  // Try database-first
  try {
    const dbResult = await SupabaseDataService.getQueuePrediction(centreId);
    if (dbResult) {
      return dbResult;
    }
  } catch (err) {
    console.warn('Database queue prediction failed, using client-side fallback:', err);
  }

  // Fallback: client-side calculation
  return calculateQueuePrediction(centreId, bookings, averageProcessingTimeMins, noShowRatePercent);
}

/**
 * Client-side Queue Prediction (Fallback)
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
