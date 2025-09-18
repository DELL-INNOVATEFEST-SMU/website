import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/services/supabase/auth";
import type { AuthState, LoginCredentials } from "@/types/auth";
import type { SupabaseUser, SupabaseSession } from "@/services/supabase/types";

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  ensureAuth: () => Promise<void>;
  upgradeToAccount: (credentials: LoginCredentials) => Promise<void>;
}

/**
 * Custom hook for managing authentication state and operations
 * Now supports guest mode with sessionStorage persistence
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAnonymous: false,
  });

  /**
   * Transform Supabase user to our AuthUser type
   */
  const transformUser = useCallback((user: SupabaseUser | null) => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_anonymous: user.is_anonymous || false,
    };
  }, []);

  /**
   * Transform Supabase session to our AuthSession type
   */
  const transformSession = useCallback((session: SupabaseSession | null) => {
    if (!session) return null;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      token_type: session.token_type,
      user: transformUser(session.user)!,
    };
  }, [transformUser]);

  /**
   * Update auth state
   */
  const updateAuthState = useCallback((session: SupabaseSession | null) => {
    const user = transformUser(session?.user ?? null);
    const isAnonymous = user?.is_anonymous || false;
    
    setState({
      user,
      session: transformSession(session),
      loading: false,
      error: null,
      isAnonymous,
    });
  }, [transformUser, transformSession]);

  /**
   * Initialize auth state on mount - with guest mode fallback
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get existing session (including stored anonymous)
        const session = await AuthService.getSession();
        
        if (session) {
          updateAuthState(session);
        } else {
          // Create anonymous user for guest experience
          console.log("No session found, creating guest session");
          const user = await AuthService.ensureGuestAuth();
          const newSession = await AuthService.getSession();
          updateAuthState(newSession);
        }
      } catch (error) {
        // Even on error, try to provide guest experience
        try {
          console.log("Auth error, falling back to guest session");
          const user = await AuthService.ensureGuestAuth();
          const newSession = await AuthService.getSession();
          updateAuthState(newSession);
        } catch (guestError) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : "Authentication error",
          }));
        }
      }
    };

    initializeAuth();
  }, [updateAuthState]);

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.is_anonymous ? "anonymous" : "authenticated");
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
   * Sign in anonymously
   */
  const signInAnonymously = useCallback(async (): Promise<void> => {
    // Don't set loading if already authenticated
    if (state.user && !state.loading) {
      console.log("User already authenticated, skipping anonymous sign-in");
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthService.signInAnonymously();
      updateAuthState(response.session);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Anonymous sign-in failed",
      }));
      throw error;
    }
  }, [updateAuthState, state.user, state.loading]);

  /**
   * Ensure user has authentication (anonymous or regular)
   */
  const ensureAuth = useCallback(async (): Promise<void> => {
    if (state.user) {
      return; // Already authenticated
    }

    try {
      await signInAnonymously();
    } catch (error) {
      console.error("Failed to ensure authentication:", error);
    }
  }, [state.user, signInAnonymously]);

  /**
   * Upgrade anonymous user to real account (alias for login)
   */
  const upgradeToAccount = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    console.log("Upgrading guest to real account");
    return login(credentials);
  }, [login]);

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
      // After logout, create new guest session
      const user = await AuthService.ensureGuestAuth();
      const newSession = await AuthService.getSession();
      updateAuthState(newSession);
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
    signInAnonymously,
    ensureAuth,
    upgradeToAccount,
  };
}