import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import ProjectsDashboard from './components/ProjectsDashboard';
import ProjectDetails from './components/ProjectDetails';
import CreateProject from './components/CreateProject';
import Profile from './components/Profile';
import Header from './components/Header';
import Spinner from './components/Spinner';
import KYCVerification from './components/KYCVerification';
import EditProject from './components/EditProject';
import ProjectUpdates from './components/ProjectUpdates';
// --- Protected Route ---
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
};

// --- Main Layout ---
const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const skipKYC = sessionStorage.getItem('skipKYC') === 'true';

  if (user && user.kycStatus === 'unverified' && !skipKYC && location.pathname !== '/kyc') {
    return <Navigate to="/kyc" replace />;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  );
};

// --- Wrappers to pass callbacks ---
const LandingWrapper: React.FC = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/auth');
  return <LandingPage onGetStarted={handleGetStarted} />;
};

const AuthWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <Auth onBack={() => navigate('/')} />;
};

// --- App Component ---
const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Spinner message="Loading application..." />
      </div>
    );
  }

  return (
    <div className="bg-navy-900 min-h-screen text-slate-300">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingWrapper /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!user ? <AuthWrapper /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ProjectsDashboard />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="/project/:projectId/edit" element={<EditProject />} />
  <Route path="/project/:projectId/updates" element={<ProjectUpdates />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* KYC */}
        <Route
          path="/kyc"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <KYCVerification />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </div>
  );
};

export default App;
