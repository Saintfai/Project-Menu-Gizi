import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route Guard for Admin/Dietary Staff.
 * Checks if admin is logged in and has appropriate role.
 */
export default function AdminRoute() {
  const { admin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Memverifikasi akses admin...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
