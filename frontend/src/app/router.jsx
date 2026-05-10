import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppLayout } from '../components/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ClinicsPage } from '../features/clinics/ClinicsPage';
import { PatientsPage } from '../features/patients/PatientsPage';
import { PatientFormPage } from '../features/patients/PatientFormPage';
import { AppointmentsPage } from '../features/appointments/AppointmentsPage';
import { AppointmentDetailPage } from '../features/appointments/AppointmentDetailPage';
import { RecordsPage } from '../features/records/RecordsPage';
import { FinancePage } from '../features/finance/FinancePage';
import { UsersPage } from '../features/users/UsersPage';
import { DentistsPage } from '../features/dentists/DentistsPage';
import { PatientRecordsPage } from '../features/medical-records/PatientRecordsPage';
import { ReportsPage } from '../features/reports/ReportsPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
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
        <Route index element={<ProtectedRoute excludeRoles={["ADMIN"]}><DashboardPage /></ProtectedRoute>} />
        <Route path="patients" element={<ProtectedRoute excludeRoles={["ADMIN"]}><PatientsPage /></ProtectedRoute>} />
        <Route path="patients/new" element={<ProtectedRoute excludeRoles={["ADMIN"]}><PatientFormPage /></ProtectedRoute>} />
        <Route path="patients/:patientId/edit" element={<ProtectedRoute excludeRoles={["ADMIN"]}><PatientFormPage /></ProtectedRoute>} />
        <Route path="patients/:patientId/records" element={<ProtectedRoute excludeRoles={["ADMIN"]}><PatientRecordsPage /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute excludeRoles={["ADMIN"]}><AppointmentsPage /></ProtectedRoute>} />
        <Route path="appointments/:id" element={<ProtectedRoute excludeRoles={["ADMIN"]}><AppointmentDetailPage /></ProtectedRoute>} />
        <Route path="records" element={<ProtectedRoute excludeRoles={["ADMIN"]}><RecordsPage /></ProtectedRoute>} />
        <Route path="finance" element={<ProtectedRoute excludeRoles={["ADMIN"]}><FinancePage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute excludeRoles={["ADMIN"]}><ReportsPage /></ProtectedRoute>} />
        <Route
          path="clinics"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ClinicsPage />
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
        <Route
          path="dentists"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DentistsPage />
            </ProtectedRoute>
          }
        />
        {/* Logs removed from admin view per request */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
