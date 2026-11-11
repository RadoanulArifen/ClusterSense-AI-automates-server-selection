import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OrderPortal from './pages/OrderPortal';
import DeploymentRequests from './pages/DeploymentRequests';
import SmartScheduling from './pages/SmartScheduling';
import DeploymentPage from './pages/DeploymentPage';
import Dashboard from './pages/Dashboard';
import PredictiveOps from './pages/PredictiveOps';
import CostOptimization from './pages/CostOptimization';
import AICopilot from './pages/AICopilot';
import WhatIfSimulator from './pages/WhatIfSimulator';
import OutcomeHistory from './pages/OutcomeHistory';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10000 } } });

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/order" element={<Protected><OrderPortal /></Protected>} />
      <Route path="/app" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="requests"   element={<DeploymentRequests />} />
        <Route path="schedule/:requestId" element={<SmartScheduling />} />
        <Route path="deploy/:requestId"   element={<DeploymentPage />} />
        <Route path="predictions" element={<PredictiveOps />} />
        <Route path="cost"        element={<CostOptimization />} />
        <Route path="copilot"     element={<AICopilot />} />
        <Route path="simulator"   element={<WhatIfSimulator />} />
        <Route path="outcomes"    element={<OutcomeHistory />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
