import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import Payment from './pages/Payment';
import ManagePackages from './pages/ManagePackages';
import UpdateStatus from './pages/UpdateStatus';
import Unauthorized from './pages/Unauthorized';
import Landing from './pages/Landing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Available to Any Authenticated User */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Customer Role specific routes are guarded by the client context inside the pages */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/payment" element={<Payment />} />
          </Route>

          {/* Admin-Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/packages" element={<ManagePackages />} />
          </Route>

          {/* Staff/Advisor/Mechanic/Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR']} />}>
            <Route path="/staff/appointments" element={<UpdateStatus />} />
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
