import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { AuthService } from "@/services/supabase/auth";
import type { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string) => Promise<{ isNewUser: boolean }>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<{ isNewUser: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  isAnonymous: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that provides authentication context to the app
 * Now supports the gate-based authentication flow
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  /**
   * Send OTP token to email for authentication
   */
  const login = async (email: string): Promise<{ isNewUser: boolean }> => {
    const result = await AuthService.sendOTP(email);
    return result;
  };

  /**
   * Verify OTP token and complete authentication
   */
  const verifyOTP = async (email: string, token: string): Promise<void> => {
    await AuthService.verifyOTP(email, token);
    // The session will be updated via onAuthStateChange
  };

  /**
   * Resend OTP token
   */
  const resendOTP = async (email: string): Promise<{ isNewUser: boolean }> => {
    const result = await AuthService.sendOTP(email);
    return result;
  };

  /**
   * Sign out and clear gate choice so it shows again
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    // After signout, show the gate again next render
    localStorage.removeItem("interstellar-gate-choice");
  };

  /**
   * Continue as guest - create anonymous user if needed
   */
  const continueAsGuest = async () => {
    // Prevent creating a new anon user if one already exists
    const existing = await supabase.auth.getSession();
    if (!existing.data.session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (!data?.user) throw new Error("Anonymous sign-in failed");
    }
    // Remember the choice so we don't show the gate again on refresh
    localStorage.setItem("interstellar-gate-choice", "guest");
  };

  const isAnonymous = !!user?.is_anonymous;

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      login,
      verifyOTP,
      resendOTP,
      signOut,
      continueAsGuest,
      isAnonymous,
    }),
    [user, session, loading, isAnonymous]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}

// Export useAuth as alias for backward compatibility
export const useAuth = useAuthContext;
