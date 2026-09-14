/**
 * NAMA FILE: App.jsx
 * FUNGSI UTAMA: Titik temu pusat (Root Component) yang membungkus struktur utama ekosistem React.
 * 
 * DETAIL:
 * - Memetakan sistem rute (Router) yang mengendalikan pergantian halaman berdasarkan alamat URL (misal: /admin, /login).
 * - Menyuntikkan Provider utama (Context) agar tersedia di seluruh aplikasi.
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';


import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { CartProvider } from './context/CartContext';


import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';


import PatientRoute from './components/guards/PatientRoute';
import AdminRoute from './components/guards/AdminRoute';


import PatientLogin from './pages/Patient/Login';
import Onboarding from './pages/Patient/Onboarding';
import MenuPortal from './pages/Patient/MenuPortal';
import Cart from './pages/Patient/Cart';
import OrderSuccess from './pages/Patient/OrderSuccess';


import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import MenuCycle from './pages/Admin/MenuCycle';
import Statistics from './pages/Admin/Statistics';


import ComponentsShowcase from './pages/ComponentsShowcase';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <PatientProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {}
              {}
              <Route path="/login" element={<PatientLogin />} />

              {}
              {}
              <Route element={<PatientRoute />}>
                <Route element={<PatientLayout />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/menu" element={<MenuPortal />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                </Route>
              </Route>

              {}
              <Route path="/menu/admin/login" element={<AdminLogin />} />

              {}
              {}
              <Route element={<AdminRoute />}>
                <Route path="/menu/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/menu/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="siklus" element={<MenuCycle />} />
                  <Route path="menu-cycle" element={<Navigate to="/menu/admin/siklus" replace />} />
                  <Route path="statistik" element={<Statistics />} />
                  <Route path="statistics" element={<Navigate to="/menu/admin/statistik" replace />} />
                  <Route path="laporan" element={<Navigate to="/menu/admin/statistik" replace />} />
                </Route>
              </Route>

              {}
              <Route path="/components" element={<ComponentsShowcase />} />

              {}
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

