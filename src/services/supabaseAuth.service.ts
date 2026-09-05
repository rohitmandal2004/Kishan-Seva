import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockStore, FarmerProfile } from './mockStore';

export interface AuthSessionUser {
  id: string;
  phone?: string;
  email?: string;
  role: 'FARMER' | 'OPERATOR' | 'ADMIN';
  full_name: string;
  is_verified: boolean;
}

// Operator credentials (stored in code for SIH demo simplicity)
const OPERATOR_CREDENTIALS = [
  { id: 'OP-001', pin: '1234', name: 'Pradip Ghosh' },
  { id: 'OP-002', pin: '1234', name: 'Subhasish Das' },
];

const ADMIN_CREDENTIALS = [
  { id: 'ADMIN', pin: 'admin123', name: 'State Admin' },
  { id: 'ADM-001', pin: 'admin123', name: 'District Commissioner' },
];

export const SupabaseAuthService = {
  /**
   * Send OTP via Supabase Email Auth.
   * Uses real Supabase signInWithOtp when configured, otherwise logs to console.
   */
  sendOtp: async (email: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
          }
        });

        if (error) {
          console.error('[Kishan Seva] Supabase OTP error:', error.message);
          // If rate limited or other Supabase error, fall through to allow demo usage
          if (error.message.includes('rate') || error.message.includes('limit')) {
            return { success: false, message: 'Too many OTP requests. Please wait a few minutes and try again.' };
          }
          return { success: false, message: error.message };
        }

        return { success: true, message: `OTP sent to ${cleanEmail}. Please check your email inbox (and spam folder).` };
      } catch (err: any) {
        console.error('[Kishan Seva] OTP send error:', err);
        return { success: false, message: err?.message || 'Failed to send OTP. Please try again.' };
      }
    }

    // Fallback if Supabase is not configured (local dev without Supabase)
    console.log(`[Kishan Seva OTP - Local Dev] Would send OTP to ${cleanEmail}`);
    return { success: true, message: `OTP sent to ${cleanEmail}` };
  },

  /**
   * Verify OTP and login as farmer.
   * Uses real Supabase verifyOtp when configured.
   */
  verifyOtp: async (email: string, token: string): Promise<{ user: AuthSessionUser; isNewUser: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (token.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP.');
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: token,
          type: 'email'
        });

        if (error) {
          throw new Error(error.message || 'Invalid OTP. Please check and try again.');
        }

        if (!data.user) {
          throw new Error('Verification failed. Please try again.');
        }

        // Supabase auth succeeded — sync with local store
        const { isNewUser } = mockStore.loginAsFarmer(cleanEmail);
        const farmer = mockStore.getFarmer();

        return {
          user: {
            id: data.user.id,
            email: cleanEmail,
            phone: farmer?.phone,
            role: 'FARMER',
            full_name: farmer?.full_name || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            is_verified: !isNewUser,
          },
          isNewUser,
        };
      } catch (err: any) {
        // If it's a Supabase error, re-throw it
        throw new Error(err?.message || 'OTP verification failed. Please try again.');
      }
    }

    // Fallback for local dev without Supabase — accept any 6-digit OTP
    console.log(`[Kishan Seva - Local Dev] Verifying OTP for ${cleanEmail}`);
    const { isNewUser } = mockStore.loginAsFarmer(cleanEmail);
    const farmer = mockStore.getFarmer();

    return {
      user: {
        id: farmer?.id || `user-${Date.now()}`,
        email: cleanEmail,
        phone: farmer?.phone,
        role: 'FARMER',
        full_name: farmer?.full_name || 'Farmer',
        is_verified: !isNewUser,
      },
      isNewUser,
    };
  },

  // Login as operator (pin-based, for SIH demo)
  loginAsOperator: async (operatorId: string, pin: string): Promise<AuthSessionUser> => {
    const op = OPERATOR_CREDENTIALS.find(o => o.id === operatorId && o.pin === pin);
    if (!op) {
      throw new Error('Invalid Operator ID or PIN');
    }
    mockStore.loginAsOperator(op.id);
    return {
      id: op.id,
      role: 'OPERATOR',
      full_name: op.name,
      is_verified: true,
    };
  },

  // Login as admin (pin-based, for SIH demo)
  loginAsAdmin: async (adminId: string, pin: string): Promise<AuthSessionUser> => {
    const admin = ADMIN_CREDENTIALS.find(a => a.id === adminId && a.pin === pin);
    if (!admin) {
      throw new Error('Invalid Admin ID or PIN');
    }
    mockStore.loginAsAdmin(admin.id);
    return {
      id: admin.id,
      role: 'ADMIN',
      full_name: admin.name,
      is_verified: true,
    };
  },

  // Register or Update Farmer Profile
  registerFarmer: async (data: Partial<FarmerProfile> & { phone?: string; email?: string }): Promise<FarmerProfile> => {
    return mockStore.registerFarmer(data);
  },

  // Sign out — clears both Supabase and local session
  signOut: async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    mockStore.logout();
  },

  // Get current session user
  getCurrentUser: async (): Promise<AuthSessionUser | null> => {
    const session = mockStore.getSession();
    if (!session.isLoggedIn) return null;

    if (session.role === 'FARMER') {
      const farmer = mockStore.getFarmer();
      if (!farmer) return null;
      return {
        id: farmer.id || session.farmerId || '',
        phone: farmer.phone || session.phone,
        email: farmer.email || session.email,
        role: 'FARMER',
        full_name: farmer.full_name || 'Farmer',
        is_verified: farmer.verification_status === 'VERIFIED',
      };
    }

    if (session.role === 'OPERATOR') {
      const op = OPERATOR_CREDENTIALS.find(o => o.id === session.operatorId);
      return {
        id: session.operatorId || '',
        role: 'OPERATOR',
        full_name: op?.name || 'Operator',
        is_verified: true,
      };
    }

    if (session.role === 'ADMIN') {
      const admin = ADMIN_CREDENTIALS.find(a => a.id === session.adminId);
      return {
        id: session.adminId || '',
        role: 'ADMIN',
        full_name: admin?.name || 'Admin',
        is_verified: true,
      };
    }

    return null;
  }
};
