import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import EquipmentPage from './pages/equipment/EquipmentPage.jsx';
import EquipmentFormPage from './pages/equipment/EquipmentFormPage.jsx';
import EquipmentDetailPage from './pages/equipment/EquipmentDetailPage.jsx';
import LaboratoriesPage from './pages/laboratories/LaboratoriesPage.jsx';
import LaboratoryFormPage from './pages/laboratories/LaboratoryFormPage.jsx';
import TransactionsPage from './pages/transactions/TransactionsPage.jsx';
import TransactionFormPage from './pages/transactions/TransactionFormPage.jsx';
import MaintenancePage from './pages/maintenance/MaintenancePage.jsx';
import MaintenanceFormPage from './pages/maintenance/MaintenanceFormPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import UserFormPage from './pages/users/UserFormPage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import ProfilePage from './pages/users/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading your workspace...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/equipment/new" element={<RequireRole roles={['admin', 'lab_assistant']}><EquipmentFormPage /></RequireRole>} />
        <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
        <Route path="/equipment/:id/edit" element={<RequireRole roles={['admin', 'lab_assistant']}><EquipmentFormPage /></RequireRole>} />
        <Route path="/laboratories" element={<LaboratoriesPage />} />
        <Route path="/laboratories/new" element={<RequireRole roles={['admin', 'lab_assistant']}><LaboratoryFormPage /></RequireRole>} />
        <Route path="/laboratories/:id/edit" element={<RequireRole roles={['admin', 'lab_assistant']}><LaboratoryFormPage /></RequireRole>} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/new" element={<TransactionFormPage />} />
        <Route path="/transactions/:id" element={<TransactionFormPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/maintenance/new" element={<MaintenanceFormPage />} />
        <Route path="/maintenance/:id/edit" element={<MaintenanceFormPage />} />
        <Route path="/users" element={<RequireRole roles={['admin']}><UsersPage /></RequireRole>} />
        <Route path="/users/new" element={<RequireRole roles={['admin']}><UserFormPage /></RequireRole>} />
        <Route path="/users/:id/edit" element={<RequireRole roles={['admin']}><UserFormPage /></RequireRole>} />
        <Route path="/reports" element={<RequireRole roles={['admin', 'lab_assistant']}><ReportsPage /></RequireRole>} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
