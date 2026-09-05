import { ProcurementCentre, CentreRecommendation } from '@/types';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Calculate Haversine distance in kilometers between two GPS coordinates
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Smart Agricultural Procurement Centre Recommendation Engine
 * 
 * Multi-factor Weighted Scoring Algorithm:
 * - 25% Distance / Travel Efficiency (Lower distance = higher score)
 * - 20% Current Queue Length (Shorter queue = higher score)
 * - 20% Predicted Waiting Time (Shorter wait = higher score)
 * - 15% Slot Availability / Capacity (More capacity = higher score)
 * - 10% Remaining Processing Capacity (Less congested = higher score)
 * - 5% Processing Efficiency (Faster turnaround = higher score)
 * - 5% Crop Compatibility & Acceptance
 */
export function evaluateCentreRecommendations(
  centres: ProcurementCentre[],
  farmerLocation: LocationCoordinates = { latitude: 22.6168, longitude: 88.4369 },
  cropName: string = 'Paddy (Grade A)',
  expectedQuantityQ: number = 40
): CentreRecommendation[] {
  if (!centres || centres.length === 0) return [];

  // Filter centres accepting this crop and active
  const candidateCentres = centres.map((centre) => {
    const dist =
      centre.distance_km ??
      calculateHaversineDistance(
        farmerLocation.latitude,
        farmerLocation.longitude,
        centre.latitude,
        centre.longitude
      );

    // Approximate travel time (assuming rural average tractor/tempo speed 25 km/h)
    const travelTimeMins = Math.round((dist / 25) * 60);

    return {
      centre,
      distanceKm: dist,
      travelTimeMins,
      queue: centre.current_queue_length,
      waitMins: centre.est_wait_time_mins || Math.round(centre.current_queue_length * 4.5),
      capacityUtil: Math.min(100, Math.round((centre.current_queue_length / 30) * 100)),
    };
  });

  // Find minimums and maximums for normalization
  const minDistance = Math.min(...candidateCentres.map((c) => c.distanceKm));
  const maxDistance = Math.max(...candidateCentres.map((c) => c.distanceKm), minDistance + 1);

  const minWait = Math.min(...candidateCentres.map((c) => c.waitMins));
  const maxWait = Math.max(...candidateCentres.map((c) => c.waitMins), minWait + 1);

  const minQueue = Math.min(...candidateCentres.map((c) => c.queue));
  const maxQueue = Math.max(...candidateCentres.map((c) => c.queue), minQueue + 1);

  // Score each candidate centre (0 to 100)
  const scoredCentres = candidateCentres.map((cand) => {
    const isCropAccepted = cand.centre.accepted_crops.some((c) =>
      c.toLowerCase().includes(cropName.toLowerCase())
    );

    // Factor 1: Distance score (0-100, closer is higher)
    const distanceScore = Math.max(0, 100 - ((cand.distanceKm - minDistance) / (maxDistance - minDistance || 1)) * 100);

    // Factor 2: Queue score (0-100, shorter queue is higher)
    const queueScore = Math.max(0, 100 - ((cand.queue - minQueue) / (maxQueue - minQueue || 1)) * 100);

    // Factor 3: Wait score (0-100, shorter wait is higher)
    const waitScore = Math.max(0, 100 - ((cand.waitMins - minWait) / (maxWait - minWait || 1)) * 100);

    // Factor 4: Capacity score (0-100, lower utilization % is higher)
    const capacityScore = Math.max(0, 100 - cand.capacityUtil);

    // Factor 5: Slot availability (assuming available if status is ACTIVE)
    const slotScore = cand.centre.status === 'ACTIVE' ? 95 : 20;

    // Factor 6: Processing score
    const processingScore = cand.centre.daily_capacity_quintals >= 800 ? 90 : 75;

    // Factor 7: Crop compatibility
    const compatibilityScore = isCropAccepted ? 100 : 0;

    // Weighted Total Calculation
    const weightedScore = Math.round(
      distanceScore * 0.25 +
      queueScore * 0.20 +
      waitScore * 0.20 +
      slotScore * 0.15 +
      capacityScore * 0.10 +
      processingScore * 0.05 +
      compatibilityScore * 0.05
    );

    const isNearest = cand.distanceKm === minDistance;

    return {
      ...cand,
      journeyScore: isCropAccepted ? weightedScore : Math.min(20, weightedScore),
      factors: {
        distance_score: parseFloat(distanceScore.toFixed(1)),
        queue_score: parseFloat(queueScore.toFixed(1)),
        wait_score: parseFloat(waitScore.toFixed(1)),
        capacity_score: parseFloat(capacityScore.toFixed(1)),
        slot_score: parseFloat(slotScore.toFixed(1)),
        processing_score: parseFloat(processingScore.toFixed(1)),
        compatibility_score: parseFloat(compatibilityScore.toFixed(1)),
      },
      isNearest,
    };
  });

  // Sort by Journey Score descending
  scoredCentres.sort((a, b) => b.journeyScore - a.journeyScore);

  const nearestCentre = scoredCentres.find((c) => c.isNearest) || scoredCentres[0];
  const optimalCentre = scoredCentres[0];

  return scoredCentres.map((item, index) => {
    const isOptimal = index === 0;
    const isNearest = item.centre.id === nearestCentre.centre.id;

    // Calculate trade-off vs nearest
    const savingsMins = Math.max(0, nearestCentre.waitMins - item.waitMins);
    const extraDistKm = parseFloat((item.distanceKm - nearestCentre.distanceKm).toFixed(1));

    const reasons: string[] = [];
    if (savingsMins > 15) {
      reasons.push(`Saves approximately ${savingsMins} minutes waiting compared to nearest centre`);
    }
    if (item.queue < nearestCentre.queue) {
      reasons.push(`${nearestCentre.queue - item.queue} fewer vehicles currently in yard`);
    }
    if (item.capacityUtil < 60) {
      reasons.push(`High remaining capacity (${100 - item.capacityUtil}% available)`);
    }
    if (item.centre.daily_capacity_quintals >= 800) {
      reasons.push(`High throughput automated weighbridge (${item.centre.daily_capacity_quintals} Q/day)`);
    }

    let tradeoffText = '';
    if (isOptimal && !isNearest && extraDistKm > 0 && savingsMins > 0) {
      tradeoffText = `Travelling ${extraDistKm} km farther, but saves approx. ${savingsMins} minutes of queue waiting.`;
    } else if (isOptimal && isNearest) {
      tradeoffText = `Closest centre with optimal queue turnaround.`;
    } else if (isNearest && !isOptimal) {
      tradeoffText = `Nearest to farm (${item.distanceKm} km), but high congestion (~${item.waitMins} min wait).`;
    }

    return {
      centre: {
        ...item.centre,
        distance_km: item.distanceKm,
        travel_time_mins: item.travelTimeMins,
      },
      journey_score: item.journeyScore,
      distance_km: item.distanceKm,
      travel_time_mins: item.travelTimeMins,
      current_queue: item.queue,
      predicted_wait_mins: item.waitMins,
      capacity_utilization_percent: item.capacityUtil,
      is_optimal: isOptimal,
      is_nearest: isNearest,
      savings_mins: savingsMins,
      factors: item.factors,
      explanation: {
        title: isOptimal ? 'Best Procurement Match' : isNearest ? 'Nearest Centre (High Queue)' : 'Alternative Centre',
        badges: [
          isOptimal ? 'Fastest Turnaround' : '',
          isNearest ? 'Closest to Farm' : '',
          item.queue <= 15 ? 'Low Queue' : 'Heavy Queue',
        ].filter(Boolean),
        tradeoff: tradeoffText,
        reasons: reasons.length > 0 ? reasons : ['Verified Government MSP Centre with active slots'],
      },
    };
  });
}
