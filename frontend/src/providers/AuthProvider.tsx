import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
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
   * Sign in with email using magic link (OTP)
   */
  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
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
      signInWithEmail,
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
