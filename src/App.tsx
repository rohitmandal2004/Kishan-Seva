import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import FarmerLogin from './pages/auth/FarmerLogin';
import FarmerRegistration from './pages/auth/FarmerRegistration';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerBookings from './pages/farmer/FarmerBookings';
import CentreDiscovery from './pages/farmer/CentreDiscovery';
import SlotBooking from './pages/farmer/SlotBooking';
import LiveQueue from './pages/farmer/LiveQueue';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import OperatorQueue from './pages/operator/OperatorQueue';
import QualityCheck from './pages/operator/QualityCheck';
import Weighment from './pages/operator/Weighment';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import RootLayout from './components/layout/RootLayout';
import FarmerLayout from './components/layout/FarmerLayout';
import OperatorLayout from './components/layout/OperatorLayout';
import RequireRole from './components/auth/RequireRole';
import ScrollToTop from './components/ui/scroll-to-top';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public Landing & Role Selection */}
          <Route index element={<LandingPage />} />
          <Route path="roles" element={<RoleSelection />} />
          
          {/* Authentication Routes */}
          <Route path="farmer/login" element={<FarmerLogin />} />
          <Route path="farmer/register" element={<FarmerRegistration />} />
          
          {/* Farmer Portal with Layout */}
          <Route path="farmer" element={<RequireRole allowedRoles={['FARMER']}><FarmerLayout /></RequireRole>}>
            <Route index element={<Navigate to="/farmer/dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="bookings" element={<FarmerBookings />} />
            <Route path="centres" element={<CentreDiscovery />} />
            <Route path="book" element={<SlotBooking />} />
            <Route path="queue" element={<LiveQueue />} />
          </Route>
          
          {/* Mandi Operator Console with Layout */}
          <Route path="operator" element={<RequireRole allowedRoles={['OPERATOR']}><OperatorLayout /></RequireRole>}>
            <Route index element={<Navigate to="/operator/dashboard" replace />} />
            <Route path="dashboard" element={<OperatorDashboard />} />
            <Route path="queue" element={<OperatorQueue />} />
            <Route path="quality" element={<QualityCheck />} />
            <Route path="weighment" element={<Weighment />} />
          </Route>
          
          {/* State Admin Routes */}
          <Route path="admin" element={<RequireRole allowedRoles={['ADMIN']}><AdminDashboard /></RequireRole>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* User-friendly Route Aliases */}
          <Route path="login" element={<Navigate to="/roles" replace />} />
          <Route path="register" element={<Navigate to="/farmer/register" replace />} />
          <Route path="dashboard" element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="centres" element={<Navigate to="/farmer/centres" replace />} />
          <Route path="mandis" element={<Navigate to="/farmer/centres" replace />} />
          <Route path="book" element={<Navigate to="/farmer/book" replace />} />
          <Route path="queue" element={<Navigate to="/farmer/queue" replace />} />
          <Route path="quality" element={<Navigate to="/operator/quality" replace />} />
          <Route path="weighment" element={<Navigate to="/operator/weighment" replace />} />
          
          {/* 404 Route Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
