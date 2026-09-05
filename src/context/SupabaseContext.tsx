import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { FarmerProfile } from '@/types';

export interface AuthSessionUser {
  id: string;
  email?: string;
  role: 'FARMER' | 'ADMIN' | 'OPERATOR';
}

interface SupabaseContextType {
  user: AuthSessionUser | null;
  farmer: FarmerProfile | null;
  isConnected: boolean;
  connectionDetails: { connected: boolean; message: string; latencyMs?: number };
  refreshConnection: () => Promise<void>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
  isProfileLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
  
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [connectionDetails] = useState<{ connected: boolean; message: string; latencyMs?: number }>({
    connected: true,
    message: 'Clerk Auth + Supabase DB'
  });

  const refreshConnection = async () => {};

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      if (!isLoaded) return;

      if (isSignedIn && clerkUser) {
        setIsProfileLoading(true);
        const email = clerkUser.primaryEmailAddress?.emailAddress;
        let role: 'FARMER' | 'ADMIN' | 'OPERATOR' = 'FARMER';
        
        if (email === 'admin@kishanseva.gov.in') role = 'ADMIN';
        else if (email === 'operator@kishanseva.gov.in') role = 'OPERATOR';

        setUser({
          id: clerkUser.id,
          email: email,
          role: role,
        });

        if (role === 'FARMER') {
          try {
            const { data, error } = await supabase
              .from('farmer_profiles')
              .select('*')
              .eq('clerk_user_id', clerkUser.id)
              .maybeSingle();

            if (!error && data && isMounted) {
              setFarmer(data as FarmerProfile);
            }
          } catch (err) {
            console.error('Failed to load farmer profile', err);
          }
        }
        if (isMounted) setIsProfileLoading(false);
      } else {
        if (isMounted) {
          setUser(null);
          setFarmer(null);
          setIsProfileLoading(false);
        }
      }
    };

    syncSession();

    return () => {
      isMounted = false;
    };
  }, [clerkUser, isLoaded, isSignedIn]);

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
    setFarmer(null);
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
        isConfigured: isLoaded,
        isProfileLoading
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

export const useAuth = () => useSupabase();
