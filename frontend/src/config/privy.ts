import { PrivyProvider } from '@privy-io/react-auth';

export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'clpispdty00ycl80fpueukbhl',
  config: {
    loginMethods: ['twitter'],
    appearance: {
      theme: 'light',
      accentColor: '#1e40af',
      logo: 'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
  },
};