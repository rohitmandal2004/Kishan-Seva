import { mockStore, FarmerProfile as StoreFarmerProfile } from './mockStore';
import type { User, FarmerProfile } from '@/types';

export const MockAuthService = {
  // Simulate sending OTP
  sendOtp: async (emailOrPhone: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock OTP sent to ${emailOrPhone}`);
        resolve(true);
      }, 500);
    });
  },

  // Simulate verifying OTP and logging in
  verifyOtp: async (emailOrPhone: string, otp: string): Promise<{ user: User; isNewUser: boolean }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp.length === 6) {
          const { isNewUser } = mockStore.loginAsFarmer(emailOrPhone);
          const farmer = mockStore.getFarmer();

          const user: User = {
            id: farmer?.id || farmer?.user_id || `user-${Date.now()}`,
            role: 'FARMER',
            phone: farmer?.phone,
            email: farmer?.email,
            status: 'ACTIVE'
          };

          resolve({ user, isNewUser });
        } else {
          reject(new Error('Invalid OTP. Please enter a valid 6-digit code.'));
        }
      }, 700);
    });
  },

  registerFarmer: async (data: Partial<StoreFarmerProfile>): Promise<StoreFarmerProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const farmer = mockStore.registerFarmer({
          ...data,
          phone: data.phone || mockStore.getSession().phone || '',
          email: data.email || mockStore.getSession().email || '',
          verification_status: 'VERIFIED'
        });
        resolve(farmer);
      }, 700);
    });
  },

  getCurrentUser: (): User | null => {
    if (!mockStore.isLoggedIn()) return null;
    const farmer = mockStore.getFarmer();
    if (!farmer) return null;
    return {
      id: farmer.id || farmer.user_id || 'unknown',
      role: 'FARMER',
      phone: farmer.phone,
      email: farmer.email,
      status: 'ACTIVE'
    };
  },

  getFarmerProfile: (): FarmerProfile | null => {
    const f = mockStore.getFarmer();
    if (!f) return null;
    return {
      id: f.id,
      user_id: f.user_id,
      farmer_code: f.farmer_code,
      full_name: f.full_name,
      phone: f.phone,
      state: f.state,
      district: f.district,
      village: f.village,
      land_area_acres: f.land_area_acres,
      verification_status: f.verification_status === 'VERIFIED' ? 'VERIFIED' : 'PENDING'
    };
  },

  logout: () => {
    mockStore.logout();
  }
};
