import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, Shield, Zap, Users } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login } = usePrivy();

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Login with your favorite social accounts or email'
    },
    {
      icon: Wallet,
      title: 'Multi-Wallet Support',
      description: 'Connect and manage multiple crypto wallets'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant access to your decentralized identity'
    },
    {
      icon: Users,
      title: 'Social Integration',
      description: 'Seamlessly connect your web2 and web3 identities'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-center text-4xl font-bold text-gray-900 mb-2">
          Welcome to CryptoAuth
        </h2>
        <p className="text-center text-lg text-gray-600 mb-8">
          Your gateway to the decentralized web
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/70 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/50">
          <div className="space-y-6">
            <button
              onClick={login}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <Shield className="h-6 w-6" aria-hidden="true" />
              </span>
              Get Started
            </button>
            
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/80 transition-all duration-300 hover:scale-105 border border-white/50"
            >
              <feature.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;