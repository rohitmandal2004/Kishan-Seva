import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseAuthService, AuthSessionUser } from '@/services/supabaseAuth.service';
import { mockStore, FarmerProfile } from '@/services/mockStore';

interface SupabaseContextType {
  user: AuthSessionUser | null;
  farmer: FarmerProfile;
  isConnected: boolean;
  connectionDetails: { connected: boolean; message: string; latencyMs?: number };
  refreshConnection: () => Promise<void>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfile>(mockStore.getFarmer());
  const [connectionDetails] = useState<{ connected: boolean; message: string; latencyMs?: number }>({
    connected: true,
    message: 'Local Storage (Offline Mode)'
  });

  const refreshConnection = async () => {
    // No external connection needed — using localStorage
  };

  useEffect(() => {
    // Initial user sync
    SupabaseAuthService.getCurrentUser().then(u => setUser(u));

    // Subscribe to store updates
    const unsubscribeStore = mockStore.subscribe(() => {
      setFarmer(mockStore.getFarmer());
      // Re-sync user on store changes
      SupabaseAuthService.getCurrentUser().then(u => setUser(u));
    });

    return () => {
      unsubscribeStore();
    };
  }, []);

  const signOut = async () => {
    await SupabaseAuthService.signOut();
    setUser(null);
  };

  return (
    <SupabaseContext.Provider
      value={{
        user,
        farmer,
        isConnected: connectionDetails.connected,
        connectionDetails,
        refreshConnection,
        signOut,
        isConfigured: true
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
