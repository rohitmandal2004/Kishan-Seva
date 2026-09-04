import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import FarmerLogin from './pages/auth/FarmerLogin';
import FarmerRegistration from './pages/auth/FarmerRegistration';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CentreDiscovery from './pages/farmer/CentreDiscovery';
import SlotBooking from './pages/farmer/SlotBooking';
import LiveQueue from './pages/farmer/LiveQueue';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import OperatorQueue from './pages/operator/OperatorQueue';
import QualityCheck from './pages/operator/QualityCheck';
import Weighment from './pages/operator/Weighment';
import AdminDashboard from './pages/admin/AdminDashboard';
import RootLayout from './components/layout/RootLayout';
import FarmerLayout from './components/layout/FarmerLayout';
import OperatorLayout from './components/layout/OperatorLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="roles" element={<RoleSelection />} />
          
          {/* Auth Routes */}
          <Route path="farmer/login" element={<FarmerLogin />} />
          <Route path="farmer/register" element={<FarmerRegistration />} />
          
          {/* Farmer Routes with Layout */}
          <Route path="farmer" element={<FarmerLayout />}>
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="centres" element={<CentreDiscovery />} />
            <Route path="book" element={<SlotBooking />} />
            <Route path="queue" element={<LiveQueue />} />
            {/* Will add more routes here later */}
          </Route>
          
          {/* Operator Routes with Layout */}
          <Route path="operator" element={<OperatorLayout />}>
            <Route path="dashboard" element={<OperatorDashboard />} />
            <Route path="queue" element={<OperatorQueue />} />
            <Route path="quality" element={<QualityCheck />} />
            <Route path="weighment" element={<Weighment />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
