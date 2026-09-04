import { mockStore, FarmerProfile as StoreFarmerProfile } from './mockStore';
import type { User, FarmerProfile } from '@/types';

export const MockAuthService = {
  // Simulate sending OTP
  sendOtp: async (phone: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock OTP sent to ${phone}: 123456`);
        resolve(true);
      }, 500);
    });
  },

  // Simulate verifying OTP and logging in
  verifyOtp: async (phone: string, otp: string): Promise<{ user: User; isNewUser: boolean }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456' || otp.length === 6) {
          mockStore.login(phone);
          const farmer = mockStore.getFarmer();

          const user: User = {
            id: farmer.user_id,
            role: 'FARMER',
            phone: farmer.phone,
            status: 'ACTIVE'
          };

          resolve({ user, isNewUser: false });
        } else {
          reject(new Error('Invalid OTP. Please enter 123456 for demo.'));
        }
      }, 700);
    });
  },

  registerFarmer: async (data: Partial<StoreFarmerProfile>): Promise<StoreFarmerProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockStore.updateFarmer({
          ...data,
          verification_status: 'VERIFIED',
          farmer_code: `KIS-FMR-${Math.floor(10000 + Math.random() * 90000)}`
        });
        resolve(mockStore.getFarmer());
      }, 700);
    });
  },

  getCurrentUser: (): User | null => {
    if (!mockStore.isLoggedIn()) return null;
    const farmer = mockStore.getFarmer();
    return {
      id: farmer.user_id,
      role: 'FARMER',
      phone: farmer.phone,
      status: 'ACTIVE'
    };
  },

  getFarmerProfile: (): FarmerProfile => {
    const f = mockStore.getFarmer();
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
      verification_status: f.verification_status === 'VERIFIED' ? 'VERIFIED' : 'DEMO_VERIFIED'
    };
  },

  logout: () => {
    mockStore.logout();
  }
};
