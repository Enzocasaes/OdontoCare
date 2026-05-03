import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppLayout } from '../components/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PatientsPage } from '../features/patients/PatientsPage';
import { PatientFormPage } from '../features/patients/PatientFormPage';
import { AppointmentsPage } from '../features/appointments/AppointmentsPage';
import { AppointmentDetailPage } from '../features/appointments/AppointmentDetailPage';
import { RecordsPage } from '../features/records/RecordsPage';
import { FinancePage } from '../features/finance/FinancePage';
import { UsersPage } from '../features/users/UsersPage';
import { DentistsPage } from '../features/dentists/DentistsPage';
import { LogsPage } from '../features/logs/LogsPage';
import { PatientRecordsPage } from '../features/medical-records/PatientRecordsPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/new" element={<PatientFormPage />} />
        <Route path="patients/:patientId/edit" element={<PatientFormPage />} />
        <Route path="patients/:patientId/records" element={<PatientRecordsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="appointments/:id" element={<AppointmentDetailPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route
          path="finance"
          element={
            <ProtectedRoute roles={['ADMIN', 'RECEPTION']}>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="dentists" element={<DentistsPage />} />
        <Route
          path="logs"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <LogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
