import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/context/SupabaseContext';
import { Loader2 } from 'lucide-react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isProfileLoading } = useSupabase();
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const location = useLocation();

  // STATE A: Clerk still loading — show spinner, NEVER redirect
  if (!clerkLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium">Loading authentication...</p>
      </div>
    );
  }

  // STATE B: Clerk loaded + not signed in (and no demo user) — redirect to login
  if (!isSignedIn && !user) {
    return <Navigate to="/roles" state={{ from: location }} replace />;
  }

  // STATE C: Clerk signed in but profile still loading — show spinner
  if (isSignedIn && (isProfileLoading || !user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium">Securing your session...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
