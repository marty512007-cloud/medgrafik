import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DoctorSchedule from "./pages/DoctorSchedule";
import AppointmentBooking from "./pages/AppointmentBooking";
import Reports from "./pages/Reports";
import DoctorManagement from "./pages/DoctorManagement";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule" element={<DoctorSchedule />} />
        <Route path="/appointments" element={<AppointmentBooking />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/doctors" element={<DoctorManagement />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}