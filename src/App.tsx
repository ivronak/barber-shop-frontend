import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffManagement } from './pages/StaffManagement';
import { AdminAppointment } from './pages/AdminAppointment';
import { AdminCalendar } from './pages/AdminCalendar';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Slots } from './pages/Slots';
import { Reports } from './pages/Reports';
import { Services } from './pages/Services';
import { GSTSettings } from './pages/GSTSettings';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthListener } from '@/components/AuthListener';
import { AdminProducts } from './pages/AdminProducts';
import { AdminUsers } from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import AdminSettings from './pages/AdminSettings';
import ShopClosures from './pages/ShopClosures';

// Staff Routes
import { StaffDashboard } from './pages/staff/Dashboard';
import { StaffAppointments } from './pages/staff/Appointments';
import { StaffCalendar } from './pages/staff/StaffCalendar';
import { StaffProfile } from './pages/staff/Profile';
import { StaffWorkingHours } from './pages/staff/WorkingHours';
import { StaffReports } from './pages/staff/Reports';
import { StaffLayout } from './components/layout/StaffLayout';

// Billing Routes
import { BillingLayout } from './components/layout/BillingLayout';
import { BillingDashboard } from './pages/billing/Dashboard';
import { BillingPOS } from './pages/billing/POS';
import { BillingCalendar } from './pages/billing/BillingCalendar';

// Public Routes
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Services as PublicServices } from './pages/public/Services';
import { Gallery } from './pages/public/Gallery';
import { Contact } from './pages/public/Contact';
import { Booking } from './pages/public/Booking';
import { Barbers } from './pages/public/Barbers';
import ScrollToTop from './components/ScrollToTop';
import AdminGalleryImages from './pages/AdminGalleryImages';
import AdminContactRequests from './pages/AdminContactRequests';
import AdminExperts from './pages/AdminExperts';
import { AdminServiceCategories } from './pages/AdminServiceCategories';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthListener />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<PublicServices />} />
          <Route path="barbers" element={<Barbers />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="booking" element={<Booking />} />
        </Route>

        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="appointments" element={<AdminAppointment />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="shop-closures" element={<ShopClosures />} />
          <Route path="customers" element={<Customers />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pos" element={<POS />} />
          <Route path="slots" element={<Slots />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="gst-settings" element={<GSTSettings />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="gallery-images" element={<AdminGalleryImages />} />
          <Route path="contact-requests" element={<AdminContactRequests />} />
          <Route path="experts" element={<AdminExperts />} />
          <Route path="service-categories" element={<AdminServiceCategories />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="calendar" element={<StaffCalendar />} />
          <Route path="reports" element={<StaffReports />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="working-hours" element={<StaffWorkingHours />} />
          <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
        </Route>

        {/* Billing Routes */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredRole="billing">
              <BillingLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/billing/dashboard" replace />} />
          <Route path="dashboard" element={<BillingDashboard />} />
          <Route path="calendar" element={<BillingCalendar />} />
          <Route path="pos" element={<BillingPOS />} />
          <Route path="*" element={<Navigate to="/billing/dashboard" replace />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;