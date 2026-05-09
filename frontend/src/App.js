import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';

import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import AnalyzePage     from './pages/AnalyzePage';
import HistoryPage     from './pages/HistoryPage';
import VideoDetailPage from './pages/VideoDetailPage';
import ProfilePage     from './pages/ProfilePage';
import NotFoundPage    from './pages/NotFoundPage';
import Navbar          from './components/ui/Navbar';

// ── Full-page loading spinner ──────────────────────────
const PageSpinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--bg-void)', flexDirection: 'column', gap: 20,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 11,
      background: 'linear-gradient(135deg,var(--amber),#d97706)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0a0a12">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    </div>
    <div className="spinner" style={{ width: 22, height: 22 }} />
  </div>
);

// ── Route guards ──────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ── App shell ─────────────────────────────────────────
const AppShell = () => {
  const { user } = useAuth();
  return (
    <ErrorBoundary>
      <div className="page">
        {user && <Navbar />}
        <Routes>
          {/* Public */}
          <Route path="/"         element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected */}
          <Route path="/dashboard"  element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/analyze"    element={<PrivateRoute><AnalyzePage /></PrivateRoute>} />
          <Route path="/history"    element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/video/:id"  element={<PrivateRoute><VideoDetailPage /></PrivateRoute>} />
          <Route path="/profile"    element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

// ── Root ──────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#0a0a12' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#0a0a12' } },
            loading: { iconTheme: { primary: '#f59e0b', secondary: '#0a0a12' } },
            duration: 3500,
          }}
        />
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
