import React from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { LogOut, User, Wallet, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) return null;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CryptoAuth
            </h1>
          </div>

          {authenticated && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.email?.address || user?.google?.email || 'User'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 rounded-lg">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {wallets.length} Wallet{wallets.length !== 1 ? 's' : ''}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;