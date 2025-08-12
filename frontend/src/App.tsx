import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { privyConfig } from './config/privy';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {authenticated ? <Dashboard /> : <LoginForm />}
    </div>
  );
};

function App() {
  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <AppContent />
    </PrivyProvider>
  );
}

export default App;