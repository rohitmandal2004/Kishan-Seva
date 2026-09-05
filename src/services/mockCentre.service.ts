import { mockStore, ProcurementCentre } from './mockStore';

export interface CentreWithStats extends ProcurementCentre {
  efficiency_score: number;
}

export const MockCentreService = {
  getNearbyCentres: async (_lat?: number, _lng?: number): Promise<CentreWithStats[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const centres = mockStore.getCentres();
        const scoredCentres: CentreWithStats[] = centres.map((c) => {
          const dist = c.distance_km ?? 10;
          const travelTimeMins = dist * 5;
          const totalJourneyMins = travelTimeMins + c.est_wait_time_mins;
          return {
            ...c,
            efficiency_score: totalJourneyMins,
          };
        });

        // Sort by best efficiency
        scoredCentres.sort((a, b) => a.efficiency_score - b.efficiency_score);
        resolve(scoredCentres);
      }, 300);
    });
  },

  getAllCentres: () => {
    return mockStore.getCentres();
  }
};
