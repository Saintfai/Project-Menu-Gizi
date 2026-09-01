import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';

/**
 * Route Guard for Inpatients.
 * Ensures the patient has logged in / verified their Medical Record (No. RM).
 */
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

  // If patient hasn't logged in with RM, redirect to login
  if (!patient || !isVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
