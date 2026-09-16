/**
 * NAMA FILE: AdminRoute.jsx
 * FUNGSI UTAMA: Route Guard untuk memproteksi akses halaman.
 * 
 * DETAIL:
 * - Memvalidasi sesi pengguna (Admin/Patient).
 * - Mengarahkan pengguna ke halaman login jika sesi tidak valid atau belum terautentikasi.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export default function AdminRoute() {
  const { admin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-sm font-medium text-neutral-500 animate-pulse">
          Memverifikasi akses admin...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return <Navigate to="/menu/admin/login" replace />;
  }

  return <Outlet />;
}
