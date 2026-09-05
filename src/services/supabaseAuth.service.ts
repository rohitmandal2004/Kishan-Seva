import { mockStore, FarmerProfile } from './mockStore';

export interface AuthSessionUser {
  id: string;
  phone?: string;
  email?: string;
  role: 'FARMER' | 'OPERATOR' | 'ADMIN';
  full_name: string;
  is_verified: boolean;
}

// Operator credentials (stored in code for simplicity)
const OPERATOR_CREDENTIALS = [
  { id: 'OP-001', pin: '1234', name: 'Pradip Ghosh' },
  { id: 'OP-002', pin: '1234', name: 'Subhasish Das' },
];

const ADMIN_CREDENTIALS = [
  { id: 'ADMIN', pin: 'admin123', name: 'State Admin' },
  { id: 'ADM-001', pin: 'admin123', name: 'District Commissioner' },
];

export const SupabaseAuthService = {
  // Send OTP (simulated — always succeeds)
  sendOtp: async (phone: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`OTP sent to ${phone}: 123456`);
    return { success: true, message: 'OTP sent to your registered mobile number' };
  },

  // Verify OTP and login as farmer
  verifyOtp: async (phone: string, token: string): Promise<{ user: AuthSessionUser; isNewUser: boolean }> => {
    if (token !== '123456' && token.length !== 6) {
      throw new Error('Invalid OTP. Please enter a valid 6-digit OTP.');
    }

    const { isNewUser } = mockStore.loginAsFarmer(phone);
    const farmer = mockStore.getFarmer();

    return {
      user: {
        id: farmer.id || `user-${Date.now()}`,
        phone: farmer.phone || phone,
        role: 'FARMER',
        full_name: farmer.full_name || 'New Farmer',
        is_verified: !isNewUser,
      },
      isNewUser,
    };
  },

  // Login as operator
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

  // Login as admin
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
  registerFarmer: async (data: Partial<FarmerProfile> & { phone: string }): Promise<FarmerProfile> => {
    return mockStore.registerFarmer(data);
  },

  // Sign out
  signOut: async (): Promise<void> => {
    mockStore.logout();
  },

  // Get current session user
  getCurrentUser: async (): Promise<AuthSessionUser | null> => {
    const session = mockStore.getSession();
    if (!session.isLoggedIn) return null;

    if (session.role === 'FARMER') {
      const farmer = mockStore.getFarmer();
      return {
        id: farmer.id || session.farmerId || '',
        phone: farmer.phone || session.phone,
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
