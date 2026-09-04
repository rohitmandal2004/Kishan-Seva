import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '@/lib/supabase';
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
  const [connectionDetails, setConnectionDetails] = useState<{ connected: boolean; message: string; latencyMs?: number }>({
    connected: true,
    message: 'Checking connection...'
  });

  const refreshConnection = async () => {
    const res = await checkSupabaseConnection();
    setConnectionDetails(res);
  };

  useEffect(() => {
    // Initial connection ping
    refreshConnection();

    // Initial user sync
    SupabaseAuthService.getCurrentUser().then(u => setUser(u));

    // Subscribe to mock store updates
    const unsubscribeStore = mockStore.subscribe(() => {
      setFarmer(mockStore.getFarmer());
    });

    // Subscribe to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const f = mockStore.getFarmer();
        setUser({
          id: session.user.id,
          phone: session.user.phone || f.phone,
          email: session.user.email,
          role: 'FARMER',
          full_name: f.full_name,
          is_verified: true
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      unsubscribeStore();
      authListener.subscription.unsubscribe();
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
        isConfigured: isSupabaseConfigured()
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
