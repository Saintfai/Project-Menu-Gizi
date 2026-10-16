import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';

// Route guard untuk memproteksi rute khusus pasien rawat inap (memeriksa verifikasi data pasien)
export default function PatientRoute() {
  const { patient, isVerified, loading } = usePatient();
  const location = useLocation();

  // Tampilkan indikator saat data pasien sedang dimuat dari storage / API
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/50">
        <div className="text-sm font-medium text-emerald-700 animate-pulse">
          Memuat data pasien...
        </div>
      </div>
    );
  }

  // Arahkan ke halaman login jika pasien belum memasukkan identitas atau belum diverifikasi
  if (!patient || !isVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render rute anak jika identitas pasien terverifikasi
  return <Outlet />;
}
