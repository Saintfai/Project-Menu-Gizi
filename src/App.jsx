/**
 * Komponen Utama Aplikasi (Root App Component)
 * Mengatur hierarki Context Provider (Auth, Patient, Cart),
 * sistem perutean React Router, transisi halaman AnimatePresence, dan notifikasi toast.
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { cleanupLegacyLocalOrders } from './services/orderService';

// Provider Context State Global
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { CartProvider } from './context/CartContext';

// Layout Pembungkus Halaman
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards (Proteksi Hak Akses)
import PatientRoute from './components/guards/PatientRoute';
import AdminRoute from './components/guards/AdminRoute';

// Halaman-halaman Alur Pasien
import PatientLogin from './pages/Patient/Login';
import Onboarding from './pages/Patient/Onboarding';
import MenuPortal from './pages/Patient/MenuPortal';
import Cart from './pages/Patient/Cart';
import OrderSuccess from './pages/Patient/OrderSuccess';

// Halaman-halaman Portal Admin Dapur Gizi
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import MenuCycle from './pages/Admin/MenuCycle';
import Statistics from './pages/Admin/Statistics';
import Chef from './pages/Admin/Chef';

// Halaman Showcase Komponen (khusus mode dev)
import ComponentsShowcase from './pages/ComponentsShowcase';

function App() {
  const location = useLocation();

  // Bersihkan data local orders lama dari localStorage (legacy dari versi sebelumnya)
  // agar tidak ada ghost data yang muncul di dashboard atau mengunci pasien
  useEffect(() => {
    cleanupLegacyLocalOrders();
  }, []);

  return (
    <AuthProvider>
      <PatientProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* ── Rute Alur Pasien Rawat Inap ───────────────────────── */}
              <Route element={<PatientLayout />}>
                <Route path="/login" element={<PatientLogin />} />

                {/* Rute pasien terproteksi (harus telah mengisi identitas rawat inap) */}
                <Route element={<PatientRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/menu" element={<MenuPortal />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                </Route>
              </Route>

              {/* ── Rute Autentikasi Admin Gizi ──────────────────────── */}
              <Route path="/menu/admin/login" element={<AdminLogin />} />

              {/* ── Rute Portal Admin Terproteksi (Dashboard, Siklus, Statistik, Chef) ── */}
              <Route element={<AdminRoute />}>
                <Route path="/menu/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/menu/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="siklus" element={<MenuCycle />} />
                  <Route path="menu-cycle" element={<Navigate to="/menu/admin/siklus" replace />} />
                  <Route path="statistik" element={<Statistics />} />
                  <Route path="chef" element={<Chef />} />
                  <Route path="statistics" element={<Navigate to="/menu/admin/statistik" replace />} />
                  <Route path="laporan" element={<Navigate to="/menu/admin/statistik" replace />} />
                </Route>
              </Route>

              {/* Rute dokumentasi komponen UI (hanya aktif saat mode development) */}
              {import.meta.env.DEV && (
                <Route path="/components" element={<ComponentsShowcase />} />
              )}

              {/* Redirect kompatibilitas URL rute admin legacy */}
              <Route path="/admin/login" element={<Navigate to="/menu/admin/login" replace />} />
              <Route path="/admin/*" element={<Navigate to="/menu/admin/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/menu/admin/dashboard" replace />} />

              {/* Fallback rute utama dan URL yang tidak dikenali */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AnimatePresence>
        </CartProvider>
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;

