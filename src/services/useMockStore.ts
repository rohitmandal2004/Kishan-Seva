import { useState, useEffect } from 'react';
import { mockStore } from './mockStore';

export function useMockStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = mockStore.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return mockStore;
}
