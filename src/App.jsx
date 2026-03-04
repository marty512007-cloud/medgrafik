import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./hooks/useToast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DoctorSchedule from "./pages/DoctorSchedule";
import AppointmentBooking from "./pages/AppointmentBooking";
import Reports from "./pages/Reports";
import DoctorManagement from "./pages/DoctorManagement";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ToastContainer from "./components/common/ToastContainer";

export default function App() {
  const { toasts, removeToast, success, error, warning, info } = useToast();

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
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

      {/* Делаем Toast функции доступными глобально через window */}
      {typeof window !== "undefined" && (
        <>
          {window.showSuccess = success}
          {window.showError = error}
          {window.showWarning = warning}
          {window.showInfo = info}
        </>
      )}
    </>
  );
}