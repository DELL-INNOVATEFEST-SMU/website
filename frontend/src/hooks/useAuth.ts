import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/services";
import type { AuthState, LoginCredentials, AuthUser, AuthSession } from "@/types/auth";
import type { SupabaseUser, SupabaseSession } from "@/services/supabase/types";

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}

/**
 * Custom hook for managing authentication state and operations
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  /**
   * Transform Supabase user to our AuthUser type
   */
  const transformUser = useCallback((user: SupabaseUser | null): AuthUser | null => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }, []);

  /**
   * Transform Supabase session to our AuthSession type
   */
  const transformSession = useCallback((session: SupabaseSession | null): AuthSession | null => {
    if (!session) return null;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      token_type: session.token_type,
      user: transformUser(session.user),
    };
  }, [transformUser]);

  /**
   * Update auth state
   */
  const updateAuthState = useCallback((session: SupabaseSession | null) => {
    setState({
      user: transformUser(session?.user ?? null),
      session: transformSession(session),
      loading: false,
      error: null,
    });
  }, [transformUser, transformSession]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getSession();
        updateAuthState(session);
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Authentication error",
        }));
      }
    };

    initializeAuth();
  }, [updateAuthState]);

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange((_event, session) => {
      updateAuthState(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  /**
   * Send OTP for login
   */
  const login = useCallback(async ({ email }: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await AuthService.sendOTP(email);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      throw error;
    }
    
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  /**
   * Verify OTP and complete login
   */
  const verifyOTP = useCallback(async (email: string, token: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthService.verifyOTP(email, token);
      updateAuthState(response.session);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "OTP verification failed",
      }));
      throw error;
    }
  }, [updateAuthState]);

  /**
   * Resend OTP
   */
  const resendOTP = useCallback(async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await AuthService.sendOTP(email);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to resend OTP",
      }));
      throw error;
    }
    
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await AuthService.signOut();
      updateAuthState(null);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
      throw error;
    }
  }, [updateAuthState]);

  return {
    ...state,
    login,
    logout,
    verifyOTP,
    resendOTP,
  };
}
