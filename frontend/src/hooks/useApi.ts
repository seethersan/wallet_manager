import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { WalletOut, MeOut, SyncResult } from '../types/api';
import { getAccessToken } from '@privy-io/react-auth';

export const useApiWallets = () => {
  const [wallets, setWallets] = useState<WalletOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const walletsData = await apiService.getWallets({ Authorization: `Bearer ${token}` });
      setWallets(walletsData);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in (err as any) && 'status' in (err as any) ? (err as any).message : 'Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return { wallets, loading, error, refetch: fetchWallets };
};

export const useMe = () => {
  const [me, setMe] = useState<MeOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      const meData = await apiService.getMe({ Authorization: `Bearer ${token}` });
      setMe(meData);
    } catch (err) {
      setError(
        err && typeof err === 'object' && 'message' in (err as any)
          ? (err as any).message
          : 'Failed to fetch user data'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { me, loading, error, refetch: fetchMe };
};

export const useSyncIdentity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncIdentity = useCallback(async (identityToken: string | null): Promise<SyncResult | null> => {
    try {
      setLoading(true);
      setError(null);
      if (!identityToken) return null;
      const result = await apiService.syncIdentity(identityToken);
      return result;
    } catch (err) {
      console.error('Error syncing identity:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync identity');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { syncIdentity, loading, error };
};