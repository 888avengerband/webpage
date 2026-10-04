import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BandDataProvider } from './context/BandDataContext';
import { SplashPage } from './components/SplashPage';
import { LoginPage } from './components/LoginPage';
import { MinimalDashboard } from './components/MinimalDashboard';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';

type AppRoute = '/' | '/login' | '/forgot-password' | '/home';

const normalizePath = (path: string): AppRoute => {
  if (path === '/login') return '/login';
  if (path === '/forgot-password') return '/forgot-password';
  if (path === '/home') return '/home';
  return '/';
};

const MainAppContent: React.FC = () => {
  const { profile, isLoading } = useAuth();

  // App flow: splash -> login -> minimal dashboard
  const [route, setRoute] = useState<AppRoute>(() => normalizePath(window.location.pathname));
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => setRoute(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: AppRoute) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setRoute(path);
  };

  useEffect(() => {
    if (!isLoading && route === '/home' && !profile) navigate('/login');
  }, [isLoading, profile, route]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body selection:bg-sky-200 selection:text-sky-900">
      {/* 1. Splash Page */}
      {route === '/' && <SplashPage onGoToLogin={() => navigate('/login')} />}

      {/* 2. Login Page */}
      {route === '/login' && (
        <LoginPage
          onBackToSplash={() => navigate('/')}
          onLoginSuccess={() => navigate('/home')}
          onForgotPassword={() => navigate('/forgot-password')}
        />
      )}

      {route === '/forgot-password' && (
        <ForgotPasswordPage onBackToLogin={() => navigate('/login')} />
      )}

      {/* 3. Very Minimal Dashboard */}
      {route === '/home' && profile && (
        <MinimalDashboard
          onLogout={() => navigate('/login')}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />
      )}

      {/* Global Modals */}
      <SupabaseSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BandDataProvider>
        <MainAppContent />
      </BandDataProvider>
    </AuthProvider>
  );
}
