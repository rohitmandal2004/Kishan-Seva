import { useSyncExternalStore } from 'react';
import { mockStore } from './mockStore';

export function useMockStore() {
  useSyncExternalStore(
    mockStore.subscribe.bind(mockStore),
    mockStore.getState.bind(mockStore)
  );

  return mockStore;
}
