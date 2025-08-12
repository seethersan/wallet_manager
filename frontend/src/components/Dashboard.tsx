import React from 'react';
import { usePrivy, useConnectWallet, useWallets, useIdentityToken } from '@privy-io/react-auth';
import { User, Mail, Plus, Wallet, Shield, Star } from 'lucide-react';
import WalletCard from './WalletCard';
import { useApiWallets, useSyncIdentity } from '../hooks/useApi';

const SyncIdentityButton: React.FC<{ refetchWallets: () => void }> = ({ refetchWallets }) => {
  const { syncIdentity, loading: syncLoading } = useSyncIdentity();
  const { identityToken } = useIdentityToken();

  const handleSyncIdentity = async () => {
    try {
      const result = await syncIdentity(identityToken);
      if (result) {
        // Refresh wallets after sync
        refetchWallets();
      } else {
        console.error('Failed to sync identity.');
      }
    } catch (error) {
      console.error('Error syncing identity:', error);
    }
  };

  return (
    <button
      onClick={handleSyncIdentity}
      disabled={syncLoading}
      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
    >
      <Shield className="w-4 h-4" />
      <span>{syncLoading ? 'Syncing...' : 'Sync Identity'}</span>
    </button>
  );
};

const AddWalletButton: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { connectWallet } = useConnectWallet();

  const handleAddWallet = async () => {
    connectWallet();
    onSuccess();
  };

  return (
    <button
      onClick={handleAddWallet}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
    >
      <Plus className="w-4 h-4" />
      <span>Add Wallet</span>
    </button>
  );
}

const LinkWalletButton: React.FC<{ refetchWallets: () => void, onSuccess: () => void }> = ({ refetchWallets, onSuccess }) => {
  const { wallets } = useWallets();
  const { identityToken } = useIdentityToken();
  const { syncIdentity } = useSyncIdentity();

  const handleLinkWallet = async () => {
    await wallets[0].loginOrLink();
    try {
      const result = await syncIdentity(identityToken);
      if (result) {
        refetchWallets();
        onSuccess();
      } else {
        console.error('Failed to sync identity.');
      }
    } catch (error) {
      console.error('Error syncing identity:', error);
    }
  };

  return (
    <button
      onClick={handleLinkWallet}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
    >
      <Plus className="w-4 h-4" />
      <span>Link Wallet</span>
    </button>
  );
}

const Dashboard: React.FC = () => {
  const { user } = usePrivy();
  const { wallets, loading: walletsLoading, error: walletsError, refetch: refetchWallets } = useApiWallets();
  const [showAddWalletButton, setShowAddWalletButton] = React.useState(true);

  const getUserDisplayName = () => {
    if (user?.twitter?.username) return user.twitter.username;
    return user?.email?.address || 'User';
  };

  const getUserName = () => {
    if (user?.twitter?.name) return user.twitter.name;
    return 'Not provided';
  };

  const getConnectedServices = () => {
    const services = [];
    if (user?.twitter) services.push({ name: 'Twitter', icon: '🐦', verified: user.twitter.profilePictureUrl ? true : false });
    return services;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {getUserDisplayName()}!
              </h1>
              <p className="text-lg text-gray-600">
                Manage your decentralized identity and wallets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{getUserName()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Services Connected</p>
                  <p className="font-medium text-gray-900">{getConnectedServices().length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Wallets Connected</p>
                  <p className="font-medium text-gray-900">
                    {walletsLoading ? '...' : wallets.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Services */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Connected Services
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getConnectedServices().map((service, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{service.icon}</span>
                    <span className="font-medium text-gray-900">{service.name}</span>
                  </div>
                  {service.verified && (
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallets Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wallet className="w-6 h-6 text-blue-600 mr-2" />
              Your Wallets
            </h2>
            <div className="flex items-center space-x-3">
              <SyncIdentityButton refetchWallets={refetchWallets} />
              {showAddWalletButton ? (
                <AddWalletButton
                  onSuccess={() => setShowAddWalletButton(false)}
                />
              ) : (
                <LinkWalletButton
                  refetchWallets={refetchWallets}
                  onSuccess={() => setShowAddWalletButton(true)}
                />
              )}
            </div>
          </div>

          {walletsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                Error loading wallets: {walletsError}
              </p>
            </div>
          )}

          {walletsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-spin mx-auto mb-4 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">Loading wallets...</p>
            </div>
          ) : wallets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.address} wallet={wallet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No wallets connected</h3>
              <p className="text-gray-600 mb-6">
                Connect your first crypto wallet to get started with web3
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                Connect Your First Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;