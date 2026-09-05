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
  const { user, isProfileLoading, farmer } = useSupabase();
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const location = useLocation();

  // Wait if Clerk hasn't loaded OR if Clerk says signed in but our context hasn't updated yet
  if (!clerkLoaded || (isSignedIn && !user) || isProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium">Securing your session...</p>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    // If not logged in, redirect to roles / auth screen
    return <Navigate to="/roles" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If logged in with incorrect role, redirect to appropriate home
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'OPERATOR') return <Navigate to="/operator/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/roles" replace />;
  }

  // Ensure Farmer profile exists if they are accessing Farmer routes
  if (user.role === 'FARMER' && allowedRoles.includes('FARMER') && !farmer) {
    return <Navigate to="/farmer/register" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
