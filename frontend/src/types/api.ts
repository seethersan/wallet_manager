// API Response Types
export interface MeOut {
  did: string;
  session_id: string;
}

export interface WalletOut {
  address: string;
  chain_type?: string | null;
  wallet_client_type?: string | null;
  connector_type?: string | null;
}

export interface SyncResult {
  did: string;
  x_username?: string | null;
  wallet_count: number;
}

// API Error Type
export interface ApiError {
  message: string;
  status: number;
}