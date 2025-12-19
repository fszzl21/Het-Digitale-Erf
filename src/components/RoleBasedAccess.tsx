import { ReactNode } from 'react';

type UserRole = 'Beheerder' | 'Manager' | 'Medewerker';

interface RoleBasedAccessProps {
  userRole: UserRole;
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedAccess({ userRole, allowedRoles, children, fallback = null }: RoleBasedAccessProps) {
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

export function useRolePermissions(userRole: UserRole) {
  return {
    canManageAllReservations: userRole === 'Beheerder' || userRole === 'Manager',
    canViewAllSickLeave: userRole === 'Beheerder' || userRole === 'Manager',
    canManageUsers: userRole === 'Beheerder',
    canUploadFiles: true, // All roles can upload
    canDeleteFiles: userRole === 'Beheerder' || userRole === 'Manager',
    canManageTasks: userRole === 'Beheerder' || userRole === 'Manager',
    canViewReports: userRole === 'Beheerder' || userRole === 'Manager',
  };
}
