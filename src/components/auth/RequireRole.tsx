import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/context/SupabaseContext';
import { Role } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { user, isProfileLoading, farmer, profileError } = useSupabase();
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const location = useLocation();

  // STATE A: Clerk still initializing — NEVER redirect during this phase
  if (!clerkLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium">Loading authentication...</p>
      </div>
    );
  }

  // STATE B: Not signed in and no demo user — redirect to roles/auth
  if (!isSignedIn && !user) {
    return <Navigate to="/roles" state={{ from: location }} replace />;
  }

  // STATE C: Clerk signed in but profile still loading from database
  if (isSignedIn && (isProfileLoading || !user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  // If we have a user but they don't match the required role
  if (user && !allowedRoles.includes(user.role as Role)) {
    // STATE F: Wrong role — redirect to correct dashboard
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'OPERATOR') return <Navigate to="/operator/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/roles" replace />;
  }

  // STATE E: Farmer role but no farmer profile exists in database
  if (user?.role === 'FARMER' && allowedRoles.includes('FARMER') && !farmer) {
    // If there was a database error, show it instead of redirecting to register
    if (profileError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-4">
          <div className="text-center max-w-md">
            <p className="text-red-600 font-semibold mb-2">Unable to load profile</p>
            <p className="text-gray-500 text-sm mb-4">{profileError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    // No profile and no error = genuinely missing profile → complete registration
    return <Navigate to="/farmer/register" replace />;
  }

  // STATE D: All checks passed — allow access
  return <>{children}</>;
};

export default RequireRole;
