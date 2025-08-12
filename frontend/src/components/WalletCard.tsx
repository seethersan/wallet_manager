import React from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { WalletOut } from '../types/api';

interface WalletCardProps {
  wallet: WalletOut;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet }) => {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = () => {
    switch (wallet.wallet_client_type) {
      case 'metamask':
        return '🦊';
      case 'coinbase_wallet':
        return '🔵';
      case 'wallet_connect':
        return '🔗';
      default:
        return '👛';
    }
  };

  const getWalletName = () => {
    switch (wallet.wallet_client_type) {
      case 'metamask':
        return 'MetaMask';
      case 'coinbase_wallet':
        return 'Coinbase Wallet';
      case 'wallet_connect':
        return 'WalletConnect';
      case 'privy':
        return 'Privy Wallet';
      case 'rainbow':
        return 'Rainbow Wallet';
      case 'zerion':
        return 'Zerion Wallet';
      case 'trust-wallet':
        return 'Trust Wallet';
      default:
        return 'Unknown Wallet';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 p-6 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
            {getWalletIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getWalletName()}</h3>
            <p className="text-sm text-gray-500 capitalize">{wallet.connector_type || 'Unknown'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
            Connected
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address</span>
            <div className="flex items-center space-x-2">
              <code className="text-sm font-mono text-gray-800">
                {formatAddress(wallet.address)}
              </code>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                title="Copy address"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Chain Type</span>
            <span className="text-sm font-mono text-gray-800">{wallet.chain_type || 'Unknown'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            <ExternalLink className="w-4 h-4" />
            <span>View on Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;