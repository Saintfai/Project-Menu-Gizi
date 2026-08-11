import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';

// Patient Pages
import PatientLogin from './pages/Patient/Login';
import Onboarding from './pages/Patient/Onboarding';
import MenuPortal from './pages/Patient/MenuPortal';
import Cart from './pages/Patient/Cart';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import MenuCycle from './pages/Admin/MenuCycle';

function App() {
  return (
    <Routes>
      {/* Redirect root to patient login for now */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Patient Routes */}
      <Route element={<PatientLayout />}>
        <Route path="/login" element={<PatientLogin />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/menu" element={<MenuPortal />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="menu-cycle" element={<MenuCycle />} />
      </Route>
    </Routes>
  );
}

export default App;
