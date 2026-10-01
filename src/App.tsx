import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BandDataProvider } from './context/BandDataContext';
import { SplashPage } from './components/SplashPage';
import { LoginPage } from './components/LoginPage';
import { MinimalDashboard } from './components/MinimalDashboard';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';

type AppView = 'splash' | 'login' | 'dashboard';

const MainAppContent: React.FC = () => {
  const { profile } = useAuth();

  // App flow: splash -> login -> minimal dashboard
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body selection:bg-sky-200 selection:text-sky-900">
      {/* 1. Splash Page */}
      {currentView === 'splash' && (
        <SplashPage onGoToLogin={() => setCurrentView('login')} />
      )}

      {/* 2. Login Page */}
      {currentView === 'login' && (
        <LoginPage
          onBackToSplash={() => setCurrentView('splash')}
          onLoginSuccess={() => setCurrentView('dashboard')}
        />
      )}

      {/* 3. Very Minimal Dashboard */}
      {currentView === 'dashboard' && (
        <MinimalDashboard
          onLogout={() => setCurrentView('splash')}
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
