import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MockAuthProvider } from './contexts/MockAuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FraudExplainer from './pages/FraudExplainer';
import RiskProfileGenerator from './pages/RiskProfileGenerator';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import DemoDashboard from './pages/DemoDashboard';  // Import the new DemoDashboard

function App() {
  return (
    <Router>
      <MockAuthProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/demo"
                element={
                  <ProtectedRoute>
                    <DemoDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fraud-explainer"
                element={
                  <ProtectedRoute>
                    <FraudExplainer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risk-profile"
                element={
                  <ProtectedRoute>
                    <RiskProfileGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance"
                element={
                  <ProtectedRoute>
                    <Performance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </MockAuthProvider>
    </Router>
  );
}

export default App;
