import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Pages (These will be created in later phases)
import Landing         from './pages/Landing';
import Login           from './pages/Login';
import Signup          from './pages/Signup';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import VerifyEmail     from './pages/VerifyEmail';
import Dashboard       from './pages/Dashboard';
import Transform       from './pages/Transform';
import TransformDetail from './pages/TransformDetail';
import Profile         from './pages/Profile';
import NotFound        from './pages/NotFound';

// Layout
import ProtectedRoute  from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <>
      <Routes>
      {/* Public */}
      <Route path="/"                element={<Landing />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/signup"          element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/verify-email"    element={<VerifyEmail />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"         element={<Dashboard />} />
        <Route path="/transform"         element={<Transform />} />
        <Route path="/transform/:id"     element={<TransformDetail />} />
        <Route path="/profile"           element={<Profile />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
    <SpeedInsights />
    </>
  );
}
