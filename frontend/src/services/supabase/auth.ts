import { supabase } from "@/lib/supabase";
import type { AuthResponse, SupabaseUser, SupabaseSession } from "./types";

// SessionStorage keys for anonymous user persistence (PDPA compliant)
const ANONYMOUS_SESSION_KEY = "supabase_anonymous_session_temp";

export class AuthService {
  /**
   * Send OTP for authentication (creates user if needed)
   * Works for both existing and new users
   */
  static async sendOTP(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Allow user creation
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send OTP specifically for existing users
   * Use when you know the user exists (e.g., forgot password flow)
   */
  static async sendOTPForExistingUser(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send OTP specifically for new user signup
   * Use when you know it's a new user (e.g., registration flow)
   */
  static async sendOTPForNewUser(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Verify 6-digit OTP token
   */
  static async verifyOTP(email: string, token: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(), // Clean the token
      type: "email",
    });

    if (error) {
      throw new Error(error.message);
    }

    // Clear anonymous session data when signing in with real account
    this.clearAnonymousSessionData();

    return data;
  }

  /**
   * Sign in anonymously with sessionStorage persistence
   */
  static async signInAnonymously(): Promise<AuthResponse> {
    // Check if we have a stored anonymous session that's still valid
    const storedSession = this.getStoredAnonymousSession();
    if (storedSession && this.isSessionValid(storedSession)) {
      console.log("Using stored anonymous session from sessionStorage");
      
      try {
        // Set the session in Supabase client
        const { data, error } = await supabase.auth.setSession({
          access_token: storedSession.access_token,
          refresh_token: storedSession.refresh_token,
        });
        
        if (!error && data.session) {
          // Update stored session with refreshed data
          this.storeAnonymousSession(data.session);
          return {
            user: data.session.user,
            session: data.session,
          };
        }
      } catch (restoreError) {
        console.error("Failed to restore anonymous session:", restoreError);
        // Clear invalid stored session
        this.clearAnonymousSessionData();
      }
    }

    // Create new anonymous session
    console.log("Creating new anonymous session for guest experience");
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      throw new Error(error.message);
    }

    // Store the anonymous session in sessionStorage (clears on tab close)
    if (data.session) {
      this.storeAnonymousSession(data.session);
    }

    return data;
  }

  /**
   * Get current session with anonymous session fallback
   */
  static async getSession(): Promise<SupabaseSession | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    // If no session but we have a stored anonymous session, try to restore it
    if (!session) {
      const storedSession = this.getStoredAnonymousSession();
      if (storedSession && this.isSessionValid(storedSession)) {
        console.log("Restoring anonymous session from sessionStorage");
        
        try {
          // Try to restore the session
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token,
          });
          
          if (!setError && data.session) {
            // Update stored session with refreshed data
            this.storeAnonymousSession(data.session);
            return data.session;
          }
        } catch (restoreError) {
          console.error("Failed to restore anonymous session:", restoreError);
          // Clear invalid stored session
          this.clearAnonymousSessionData();
        }
      }
    }

    return session;
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<SupabaseUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  }

  /**
   * Check if current user is anonymous
   */
  static async isAnonymous(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.is_anonymous || false;
  }

  /**
   * Check if user is authenticated (not anonymous)
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user && !user.is_anonymous;
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    // Clear anonymous session data on sign out
    this.clearAnonymousSessionData();
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: SupabaseSession | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Store anonymous sessions for persistence (sessionStorage only)
      if (session && session.user?.is_anonymous) {
        this.storeAnonymousSession(session);
      }
      
      // Clear anonymous data when signing out or signing in with real account
      if (event === 'SIGNED_OUT' || (session && !session.user?.is_anonymous)) {
        this.clearAnonymousSessionData();
      }
      
      callback(event, session);
    });
  }

  /**
   * Refresh session
   */
  static async refreshSession(): Promise<SupabaseSession | null> {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Error refreshing session:", error);
      return null;
    }

    // Update stored anonymous session if it's anonymous
    if (session && session.user?.is_anonymous) {
      this.storeAnonymousSession(session);
    }

    return session;
  }


  // --- Private helper methods for sessionStorage persistence (PDPA compliant) ---

  /**
   * Store anonymous session in sessionStorage (clears on tab close)
   */
  private static storeAnonymousSession(session: SupabaseSession): void {
    try {
      if (session.user?.is_anonymous) {
        // Use sessionStorage instead of localStorage for PDPA compliance
        sessionStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
          user: session.user,
        }));
        
        console.log("Anonymous session stored in sessionStorage (clears on tab close)");
      }
    } catch (error) {
      console.error("Failed to store anonymous session:", error);
    }
  }

  /**
   * Get stored anonymous session from sessionStorage
   */
  private static getStoredAnonymousSession(): SupabaseSession | null {
    try {
      const stored = sessionStorage.getItem(ANONYMOUS_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to parse stored anonymous session:", error);
      // Clear corrupted data
      this.clearAnonymousSessionData();
    }
    return null;
  }

  /**
   * Check if a session is still valid (not expired)
   */
  private static isSessionValid(session: SupabaseSession): boolean {
    if (!session.expires_at) return false;
    
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return expiresAt.getTime() > (now.getTime() + bufferTime);
  }

  /**
   * Clear stored anonymous session data
   */
  private static clearAnonymousSessionData(): void {
    try {
      sessionStorage.removeItem(ANONYMOUS_SESSION_KEY);
      console.log("Anonymous session data cleared from sessionStorage");
    } catch (error) {
      console.error("Failed to clear anonymous session data:", error);
    }
  }
}