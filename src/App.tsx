import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Standard Components
import RootLayout from './components/layout/RootLayout';
import FarmerLayout from './components/layout/FarmerLayout';
import OperatorLayout from './components/layout/OperatorLayout';
import AdminLayout from './components/layout/AdminLayout';
import RequireRole from './components/auth/RequireRole';
import ScrollToTop from './components/ui/scroll-to-top';
import { ReloadPrompt } from './components/ui/ReloadPrompt';
import PageLoader from './components/ui/PageLoader';

// Lazy-loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages
const FarmerLogin = lazy(() => import('./pages/auth/FarmerLogin'));
const FarmerRegistration = lazy(() => import('./pages/auth/FarmerRegistration'));

// Farmer Pages
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const FarmerBookings = lazy(() => import('./pages/farmer/FarmerBookings'));
const CentreDiscovery = lazy(() => import('./pages/farmer/CentreDiscovery'));
const SlotBooking = lazy(() => import('./pages/farmer/SlotBooking'));
const LiveQueue = lazy(() => import('./pages/farmer/LiveQueue'));
const FarmerPayments = lazy(() => import('./pages/farmer/FarmerPayments'));
const FarmerProfile = lazy(() => import('./pages/farmer/FarmerProfile'));
const FarmerNotifications = lazy(() => import('./pages/farmer/FarmerNotifications'));
const FarmerSupport = lazy(() => import('./pages/farmer/FarmerSupport'));

// Operator Pages
const OperatorDashboard = lazy(() => import('./pages/operator/OperatorDashboard'));
const OperatorQueue = lazy(() => import('./pages/operator/OperatorQueue'));
const QualityCheck = lazy(() => import('./pages/operator/QualityCheck'));
const Weighment = lazy(() => import('./pages/operator/Weighment'));

// Admin Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminCentres = lazy(() => import('./pages/admin/AdminCentres'));
const AdminSlots = lazy(() => import('./pages/admin/AdminSlots'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" richColors closeButton />
      <ReloadPrompt />
      
      <Suspense fallback={<PageLoader />}>
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
              <Route path="payments" element={<FarmerPayments />} />
              <Route path="profile" element={<FarmerProfile />} />
              <Route path="notifications" element={<FarmerNotifications />} />
              <Route path="support" element={<FarmerSupport />} />
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
            <Route path="admin" element={<RequireRole allowedRoles={['ADMIN']}><AdminLayout /></RequireRole>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="centres" element={<AdminCentres />} />
              <Route path="slots" element={<AdminSlots />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="transactions" element={<AdminTransactions />} />
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
      </Suspense>
    </Router>
  );
}

export default App;
