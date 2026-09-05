import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/context/SupabaseContext';
import { Role } from '@/types';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { user, isConfigured } = useSupabase();
  const location = useLocation();

  if (!user) {
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

  return <>{children}</>;
};

export default RequireRole;
