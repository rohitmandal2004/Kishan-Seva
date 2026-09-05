import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/context/SupabaseContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useSupabase();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/roles" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
