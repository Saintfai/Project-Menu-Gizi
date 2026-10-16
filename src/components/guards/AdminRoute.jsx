import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Route guard untuk memproteksi rute khusus admin gizi (memeriksa status autentikasi admin)
export default function AdminRoute() {
  const { admin, isAuthenticated, loading } = useAuth();

  // Tampilkan indikator saat status autentikasi masih diverifikasi
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-sm font-medium text-neutral-500 animate-pulse">
          Memverifikasi akses admin...
        </div>
      </div>
    );
  }

  // Arahkan ke halaman login admin jika sesi admin belum terverifikasi
  if (!isAuthenticated || !admin) {
    return <Navigate to="/menu/admin/login" replace />;
  }

  // Render rute anak jika akses admin valid
  return <Outlet />;
}
