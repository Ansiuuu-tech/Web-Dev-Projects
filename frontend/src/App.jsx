import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/authStore';

// Pages
import Landing       from './pages/Landing';
import Login         from './pages/Login';
import AppLayout     from './pages/AppLayout';
import Dashboard     from './pages/Dashboard';
import Donations     from './pages/Donations';
import DonationDetail from './pages/DonationDetail';
import DonateItem    from './pages/DonateItem';
import RoutePlanner  from './pages/RoutePlanner';
import Scheduling    from './pages/Scheduling';
import Marketplace   from './pages/Marketplace';
import Analytics     from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile       from './pages/Profile';
import TrackPublic   from './pages/TrackPublic';

// Route Guards
const PrivateRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/app/dashboard" replace />;
  return children;
};

export default function App() {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration:3500, style:{ fontFamily:'var(--font)', fontSize:13 } }} />
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Landing />} />
        <Route path="/track/:trackingId" element={<TrackPublic />} />
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />

        {/* App (protected) */}
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="donations"   element={<Donations />} />
          <Route path="donations/:id" element={<DonationDetail />} />
          <Route path="donate"      element={<DonateItem />} />
          <Route path="routes"      element={<PrivateRoute roles={['ngo_staff','admin']}><RoutePlanner /></PrivateRoute>} />
          <Route path="scheduling"  element={<PrivateRoute roles={['ngo_staff','admin']}><Scheduling /></PrivateRoute>} />
          <Route path="marketplace" element={<PrivateRoute roles={['ngo_staff','admin']}><Marketplace /></PrivateRoute>} />
          <Route path="analytics"   element={<PrivateRoute roles={['ngo_staff','admin']}><Analytics /></PrivateRoute>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile"     element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
