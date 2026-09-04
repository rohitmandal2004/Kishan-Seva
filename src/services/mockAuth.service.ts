import type { User, FarmerProfile } from '@/types';

// Mock database state
let mockUser: User | null = null;
let mockFarmerProfile: FarmerProfile | null = null;

export const MockAuthService = {
  // Simulate sending OTP
  sendOtp: async (phone: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock OTP sent to ${phone}`);
        resolve(true);
      }, 1000);
    });
  },

  // Simulate verifying OTP and logging in
  verifyOtp: async (phone: string, otp: string): Promise<{ user: User, isNewUser: boolean }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') { // Mock valid OTP
          // Check if it's our seed demo user
          if (phone === '9876543210') {
            mockUser = {
              id: 'user-1',
              role: 'FARMER',
              phone: '9876543210',
              status: 'ACTIVE'
            };
            mockFarmerProfile = {
              id: 'farmer-1',
              user_id: 'user-1',
              farmer_code: 'KIS-FMR-00001',
              full_name: 'Rohit Mandal',
              phone: '9876543210',
              state: 'West Bengal',
              district: 'North 24 Parganas',
              village: 'Basirhat',
              land_area_acres: 4.3,
              verification_status: 'VERIFIED'
            };
            resolve({ user: mockUser, isNewUser: false });
          } else {
            // New user registration flow
            mockUser = {
              id: `user-${Date.now()}`,
              role: 'FARMER',
              phone,
              status: 'ACTIVE'
            };
            resolve({ user: mockUser, isNewUser: true });
          }
        } else {
          reject(new Error('Invalid OTP'));
        }
      }, 1500);
    });
  },

  registerFarmer: async (data: Partial<FarmerProfile>): Promise<FarmerProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockFarmerProfile = {
          id: `farmer-${Date.now()}`,
          user_id: mockUser?.id || `user-${Date.now()}`,
          farmer_code: `KIS-FMR-${Math.floor(10000 + Math.random() * 90000)}`,
          full_name: data.full_name || 'Demo Farmer',
          phone: data.phone || '0000000000',
          state: data.state || '',
          district: data.district || '',
          village: data.village || '',
          land_area_acres: data.land_area_acres || 0,
          verification_status: 'DEMO_VERIFIED'
        };
        resolve(mockFarmerProfile);
      }, 1500);
    });
  },

  getCurrentUser: () => mockUser,
  getFarmerProfile: () => mockFarmerProfile,
  
  logout: () => {
    mockUser = null;
    mockFarmerProfile = null;
  }
};
