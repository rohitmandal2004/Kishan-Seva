import { ProcurementCentre } from '@/types';

// Extended type to include mock real-time stats for the recommendation engine
export interface CentreWithStats extends ProcurementCentre {
  distance_km: number;
  current_queue_length: number;
  est_wait_time_mins: number;
  efficiency_score: number; // Lower is better (calculated based on distance + wait time)
}

const MOCK_CENTRES: CentreWithStats[] = [
  {
    id: 'centre-1',
    centre_code: 'KSP-001',
    name: 'Krishnapur Procurement Centre',
    address: 'Krishnapur Main Road, Near Gram Panchayat',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.6231,
    longitude: 88.4357,
    daily_capacity: 500,
    status: 'ACTIVE',
    distance_km: 4.2,
    current_queue_length: 28,
    est_wait_time_mins: 140, // 2.3 hours
    efficiency_score: 0,
  },
  {
    id: 'centre-2',
    centre_code: 'KSP-002',
    name: 'Rajarhat Krishi Mandi',
    address: 'Rajarhat Chowmatha',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.6152,
    longitude: 88.4651,
    daily_capacity: 800,
    status: 'ACTIVE',
    distance_km: 6.8,
    current_queue_length: 5,
    est_wait_time_mins: 25, // Very short wait
    efficiency_score: 0,
  },
  {
    id: 'centre-3',
    centre_code: 'KSP-003',
    name: 'Barasat Govt. Procurement Yard',
    address: 'NH-12, Barasat Dakbungalow',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.7231,
    longitude: 88.4812,
    daily_capacity: 1200,
    status: 'ACTIVE',
    distance_km: 12.5,
    current_queue_length: 45,
    est_wait_time_mins: 225, 
    efficiency_score: 0,
  },
  {
    id: 'centre-4',
    centre_code: 'KSP-004',
    name: 'Madhyamgram Sub-Divisional Centre',
    address: 'Madhyamgram Chowmatha',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    latitude: 22.6987,
    longitude: 88.4521,
    daily_capacity: 600,
    status: 'ACTIVE',
    distance_km: 8.1,
    current_queue_length: 12,
    est_wait_time_mins: 60, 
    efficiency_score: 0,
  }
];

export const MockCentreService = {
  getNearbyCentres: async (lat: number, lng: number): Promise<CentreWithStats[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Calculate efficiency score (Journey Efficiency = Distance Factor + Wait Time Factor)
        // Let's assume 1 km of travel = 5 mins of time.
        const scoredCentres = MOCK_CENTRES.map(c => {
          const travelTimeMins = c.distance_km * 5; 
          const totalJourneyMins = travelTimeMins + c.est_wait_time_mins;
          return {
            ...c,
            efficiency_score: totalJourneyMins
          };
        });

        // Sort by best efficiency (lowest total journey time)
        scoredCentres.sort((a, b) => a.efficiency_score - b.efficiency_score);
        
        resolve(scoredCentres);
      }, 800);
    });
  }
};
