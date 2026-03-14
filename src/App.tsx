import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Compliance from './pages/Compliance';
import AIAgent from './pages/AIAgent';
import AuditTrail from './pages/AuditTrail';
import Transactions from './pages/Transactions';
import Wallets from './pages/Wallets';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen app-theme bg-slate-950 flex items-center justify-center text-slate-300">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedLayout>
              <Payments />
            </ProtectedLayout>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedLayout>
              <Compliance />
            </ProtectedLayout>
          }
        />
        <Route
          path="/ai-agent"
          element={
            <ProtectedLayout>
              <AIAgent />
            </ProtectedLayout>
          }
        />
        <Route
          path="/audit-trail"
          element={
            <ProtectedLayout>
              <AuditTrail />
            </ProtectedLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedLayout>
              <Transactions />
            </ProtectedLayout>
          }
        />
        <Route
          path="/wallets"
          element={
            <ProtectedLayout>
              <Wallets />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
