import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { FarmerProfile } from '@/types';

export type AppRole = 'FARMER' | 'ADMIN' | 'OPERATOR';

export interface AuthSessionUser {
  id: string;
  email?: string;
  role: AppRole;
}

interface SupabaseContextType {
  // --- AUTH STATE (Clerk) ---
  /** True once Clerk has finished loading authentication state */
  isLoaded: boolean;
  /** True if an active Clerk session is established */
  isSignedIn: boolean;
  /** Direct Clerk user object */
  clerkUser: ReturnType<typeof useUser>['user'];
  /** Primary Clerk user ID */
  clerkUserId: string | null;

  // --- APPLICATION PROFILE STATE (Supabase) ---
  /** Farmer profile from Supabase (null if not a farmer or not loaded) */
  farmer: FarmerProfile | null;
  /** Application role derived strictly from profile tables */
  role: AppRole | null;
  /** True while the database profile query is in-flight */
  profileLoading: boolean;
  /** Alias for profileLoading */
  isProfileLoading: boolean;
  /** True if a database profile was successfully loaded */
  profileExists: boolean;
  /** True if a database network/connection error occurred during fetch */
  profileError: string | null;
  /** Direct lookup function for farmer profile by clerkUserId and email */
  fetchFarmerProfile: (clerkUserId: string, email?: string) => Promise<FarmerProfile | null>;
  /** Force a re-fetch of the profile from Supabase */
  refreshProfile: () => Promise<void>;
  /** Resolve the application role for a user */
  resolveRole: (clerkUserId: string, email?: string) => Promise<{ role: AppRole; farmerProfile: FarmerProfile | null }>;

  // --- COMPATIBILITY & SYSTEM ---
  /** Clerk + database-derived user (null until both are resolved) */
  user: AuthSessionUser | null;
  /** True while Supabase is reachable */
  isConnected: boolean;
  connectionDetails: { connected: boolean; message: string; latencyMs?: number };
  refreshConnection: () => Promise<void>;
  /** Sign out from Clerk and clear all application state */
  signOut: () => Promise<void>;
  /** True once Clerk has finished its initial load */
  isConfigured: boolean;
  /**
   * Set a demo role for operator/admin (used by RoleSelection demo login).
   * This does NOT create a Clerk session — it only sets the in-memory role.
   */
  setDemoRole: (role: AppRole) => void;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();
  const { isSignedIn, isLoaded: clerkAuthLoaded } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();

  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [demoRole, setDemoRoleState] = useState<AppRole | null>(null);
  const [connectionDetails] = useState<{ connected: boolean; message: string; latencyMs?: number }>({
    connected: true,
    message: 'Clerk Auth + Supabase DB'
  });

  const isLoaded = Boolean(clerkUserLoaded && clerkAuthLoaded);
  const clerkUserId = clerkUser?.id || null;
  const role = user?.role || null;
  const profileExists = Boolean(farmer);

  const refreshConnection = async () => {};

  /**
   * Fetch the farmer profile from Supabase by clerk_user_id (with fallback to email lookup).
   * Automatically links legacy profiles to clerk_user_id if found by email.
   * Distinguishes "not found" from "database error".
   */
  const fetchFarmerProfile = useCallback(async (clerkUserId: string, email?: string): Promise<FarmerProfile | null> => {
    if (!isSupabaseConfigured()) {
      console.warn('[Kishan Seva] Supabase not configured — cannot load farmer profile');
      return null;
    }

    try {
      // 1. Try finding by clerk_user_id first if provided
      if (clerkUserId) {
        const { data: byClerkId, error: clerkError } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .maybeSingle();

        if (clerkError) {
          console.error('[Kishan Seva] Database error loading farmer profile by clerk_id:', clerkError.message);
        }

        if (byClerkId) {
          setProfileError(null);
          return byClerkId as FarmerProfile;
        }
      }

      // 2. Fallback: Check if profile exists by email (e.g. registered prior to Clerk migration or during login)
      const cleanEmail = email?.trim().toLowerCase();
      if (cleanEmail) {
        const { data: byEmail, error: emailError } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (emailError) {
          console.error('[Kishan Seva] Database error loading farmer profile by email:', emailError.message);
        }

        if (byEmail) {
          // Auto-link clerk_user_id to this profile if clerkUserId is available
          if (clerkUserId && byEmail.clerk_user_id !== clerkUserId) {
            await supabase
              .from('farmer_profiles')
              .update({ clerk_user_id: clerkUserId, role: 'FARMER' })
              .eq('id', byEmail.id);
          }

          setProfileError(null);
          return { ...byEmail, ...(clerkUserId ? { clerk_user_id: clerkUserId } : {}), role: 'FARMER' } as FarmerProfile;
        }
      }

      // data is null if no row found — this is "profile not found", NOT an error
      setProfileError(null);
      return null;
    } catch (err: any) {
      console.error('[Kishan Seva] Network error loading farmer profile:', err);
      setProfileError('Unable to connect to the database. Please check your connection.');
      return null;
    }
  }, []);

  /**
   * Determine the user's role by checking database profile tables.
   * Sourced strictly from application profile data.
   */
  const resolveRole = useCallback(async (clerkUserId: string, email?: string): Promise<{ role: AppRole; farmerProfile: FarmerProfile | null }> => {
    if (!isSupabaseConfigured()) {
      return { role: 'FARMER', farmerProfile: null };
    }

    // 1. Check farmer_profiles first (most common case)
    const farmerProfile = await fetchFarmerProfile(clerkUserId, email);
    if (farmerProfile) {
      const role = (farmerProfile.role as AppRole) || 'FARMER';
      return { role, farmerProfile };
    }

    // 2. Check operator_profiles
    try {
      const { data: opData } = await supabase
        .from('operator_profiles')
        .select('id')
        .eq('user_id', clerkUserId)
        .maybeSingle();
      if (opData) {
        return { role: 'OPERATOR', farmerProfile: null };
      }
    } catch { /* ignore — table may not exist */ }

    // 3. Check admin_profiles
    try {
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', clerkUserId)
        .maybeSingle();
      if (adminData) {
        return { role: 'ADMIN', farmerProfile: null };
      }
    } catch { /* ignore — table may not exist */ }

    // 4. No profile found anywhere — default to FARMER (new user)
    return { role: 'FARMER', farmerProfile: null };
  }, [fetchFarmerProfile]);

  // Sync Clerk session → application state
  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      if (!isLoaded) return;

      if (isSignedIn && clerkUser) {
        // Clear any stale demo role when a real Clerk session is active
        if (demoRole) setDemoRoleState(null);
        setIsProfileLoading(true);
        setProfileError(null);

        const email = clerkUser.primaryEmailAddress?.emailAddress;
        const { role, farmerProfile } = await resolveRole(clerkUser.id, email);

        if (!isMounted) return;

        setUser({
          id: clerkUser.id,
          email,
          role,
        });
        setFarmer(farmerProfile);
        setIsProfileLoading(false);
      } else {
        // Not signed in — check for demo role
        if (isMounted) {
          if (demoRole) {
            // Demo login for operator/admin (no Clerk session)
            setUser({
              id: `demo-${demoRole.toLowerCase()}`,
              email: undefined,
              role: demoRole,
            });
          } else {
            setUser(null);
          }
          setFarmer(null);
          setIsProfileLoading(false);
          setProfileError(null);
        }
      }
    };

    syncSession();

    return () => {
      isMounted = false;
    };
  }, [clerkUser, isLoaded, isSignedIn, resolveRole, demoRole]);

  const refreshProfile = useCallback(async () => {
    if (!clerkUser?.id) return;
    setIsProfileLoading(true);
    setProfileError(null);
    const { role, farmerProfile } = await resolveRole(clerkUser.id, clerkUser.primaryEmailAddress?.emailAddress);
    setUser(prev => prev ? { ...prev, role } : null);
    setFarmer(farmerProfile);
    setIsProfileLoading(false);
  }, [clerkUser, resolveRole]);

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (err) {
      console.error('[Kishan Seva] Error during sign out:', err);
    }
    setUser(null);
    setFarmer(null);
    setDemoRoleState(null);
    setProfileError(null);
  };

  const setDemoRole = (role: AppRole) => {
    setDemoRoleState(role);
  };

  return (
    <SupabaseContext.Provider
      value={{
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
        clerkUser: clerkUser || null,
        clerkUserId,
        farmer,
        role,
        profileLoading: isProfileLoading,
        isProfileLoading,
        profileExists,
        profileError,
        fetchFarmerProfile,
        refreshProfile,
        resolveRole,
        user,
        isConnected: connectionDetails.connected,
        connectionDetails,
        refreshConnection,
        signOut,
        isConfigured: isLoaded,
        setDemoRole,
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
