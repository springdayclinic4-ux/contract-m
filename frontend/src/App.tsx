import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DailyContractPage from './pages/DailyContractPage';
import ComingSoonPage from './pages/ComingSoonPage';
import ContractsListPage from './pages/ContractsListPage';
import ContractDetailPage from './pages/ContractDetailPage';
import ContractInvitationPage from './pages/ContractInvitationPage';
import StatisticsPage from './pages/StatisticsPage';
import AdminConsolePage from './pages/AdminConsolePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function RootRedirect() {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contracts/daily" element={<DailyContractPage />} />
        <Route path="/contracts/regular" element={<ComingSoonPage />} />
        <Route path="/contracts/invitation/:token" element={<ContractInvitationPage />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />
        <Route path="/contracts" element={<ContractsListPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/ops-panel-7x9k2m" element={<AdminConsolePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
