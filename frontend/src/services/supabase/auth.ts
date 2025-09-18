import { supabase } from "./client";
import type { AuthResponse, SupabaseUser, SupabaseSession } from "./types";

export class AuthService {
  /**
   * Send OTP to email for authentication
   */
  static async sendOTP(email: string): Promise<void> {
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
   * Verify OTP token and sign in user
   */
  static async verifyOTP(email: string, token: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Sign in anonymously
   */
  static async signInAnonymously(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<SupabaseSession | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
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
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: SupabaseSession | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
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

    return session;
  }

  /**
   * Ensure user has authentication (anonymous or regular)
   */
  static async ensureAuth(): Promise<SupabaseUser | null> {
    let user = await this.getCurrentUser();
    
    if (!user) {
      try {
        console.log("No user found, creating anonymous session");
        const response = await this.signInAnonymously();
        user = response.user;
        console.log("Anonymous session created successfully");
      } catch (error) {
        console.error("Failed to create anonymous session:", error);
      }
    }
    
    return user;
  }
}