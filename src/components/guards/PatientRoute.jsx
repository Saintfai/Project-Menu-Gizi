/**
 * NAMA FILE: PatientRoute.jsx
 * FUNGSI UTAMA: Route Guard untuk memproteksi akses halaman.
 * 
 * DETAIL:
 * - Memvalidasi sesi pengguna (Admin/Patient).
 * - Mengarahkan pengguna ke halaman login jika sesi tidak valid atau belum terautentikasi.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';


export default function PatientRoute() {
  const { patient, isVerified, loading } = usePatient();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/50">
        <div className="text-sm font-medium text-emerald-700 animate-pulse">
          Memuat data pasien...
        </div>
      </div>
    );
  }

  
  if (!patient || !isVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
