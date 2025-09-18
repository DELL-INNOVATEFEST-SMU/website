export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  is_anonymous?: boolean;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  isAnonymous: boolean;
}

export interface LoginCredentials {
  email: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  ensureAuth: () => Promise<void>;
  upgradeToAccount: (credentials: LoginCredentials) => Promise<void>;
}