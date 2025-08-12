import { MeOut, WalletOut, SyncResult } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders,
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
    }
  }

  async healthCheck(headers?: HeadersInit): Promise<any> {
    return this.makeRequest('/health', { headers });
  }

  async getMe(headers?: HeadersInit): Promise<MeOut> {
    return this.makeRequest<MeOut>('/auth/me', { headers });
  }

  async getWallets(headers?: HeadersInit): Promise<WalletOut[]> {
    return this.makeRequest<WalletOut[]>('/wallets', { headers });
  }

  async syncIdentity(identityToken: string): Promise<SyncResult> {
    if (!identityToken) {
      throw new ApiError('Missing identity token', 401);
    }

    return this.makeRequest<SyncResult>('/sync-identity', {
      method: 'POST',
    }, {
      'privy-id-token': identityToken,
    });
  }
}

export const apiService = new ApiService();

// Custom error class
class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}