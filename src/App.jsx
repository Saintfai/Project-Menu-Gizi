import { Routes, Route, Navigate } from 'react-router-dom';

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

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import MenuCycle from './pages/Admin/MenuCycle';

function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <CartProvider>
          <Routes>
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
              </Route>
            </Route>

            {/* ================= PUBLIC ADMIN ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ================= PROTECTED ADMIN ================= */}
            {/* Requires dietary staff authentication */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="menu-cycle" element={<MenuCycle />} />
              </Route>
            </Route>

            {/* ================= ROOT & FALLBACK ================= */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;
