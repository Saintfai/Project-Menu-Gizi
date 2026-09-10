import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { CartProvider } from './context/CartContext';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';

// Guards
import PatientRoute from './components/guards/PatientRoute';
import AdminRoute from './components/guards/AdminRoute';

// Patient Pages
import PatientLogin from './pages/Patient/Login';
import Onboarding from './pages/Patient/Onboarding';
import MenuPortal from './pages/Patient/MenuPortal';
import Cart from './pages/Patient/Cart';
import OrderSuccess from './pages/Patient/OrderSuccess';

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import MenuCycle from './pages/Admin/MenuCycle';
import Statistics from './pages/Admin/Statistics';

// Showcase Page
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
              {/* ================= PUBLIC PATIENT ================= */}
              {/* Direct QR scan or RM search */}
              <Route path="/login" element={<PatientLogin />} />

              {/* ================= PROTECTED PATIENT ================= */}
              {/* Requires verified patient session */}
              <Route element={<PatientRoute />}>
                <Route element={<PatientLayout />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/menu" element={<MenuPortal />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                </Route>
              </Route>

              {/* ================= PUBLIC ADMIN ================= */}
              <Route path="/menu/admin/login" element={<AdminLogin />} />

              {/* ================= PROTECTED ADMIN ================= */}
              {/* Requires dietary staff authentication */}
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

              {/* Components Showcase */}
              <Route path="/components" element={<ComponentsShowcase />} />

              {/* ================= ROOT & FALLBACK ================= */}
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

