import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("recruitai_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 Initial session check:', { session, error });
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('✅ User authenticated:', session.user.email);
        
        // Create or update user object from Supabase user
        const userData: User = {
          id: session.user.id,
          username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User",
          email: session.user.email || "",
          companyName: session.user.user_metadata?.company_name || "Company",
          role: session.user.user_metadata?.role || "HR Manager",
          password: "", // Not needed for OAuth
        };
        setUser(userData);
        localStorage.setItem("recruitai_user", JSON.stringify(userData));
        
        // Check if this is a new user (first sign-in)
        const isNewUser = !localStorage.getItem('onboarding_completed');
        console.log('🆕 Is new user:', isNewUser);
        console.log('📍 Current path:', window.location.pathname);
        
        // Redirect new users to onboarding (unless already there)
        if (isNewUser && window.location.pathname !== '/onboarding') {
          console.log('🎯 Redirecting new user to onboarding');
          window.location.href = '/onboarding';
        }
      } else {
        console.log('❌ No session found');
      }
      
      setIsLoading(false);
    }).catch((err) => {
      console.error('❌ Session check error:', err);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('✅ User session updated:', session.user.email);
        const userData: User = {
          id: session.user.id,
          username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User",
          email: session.user.email || "",
          companyName: session.user.user_metadata?.company_name || "Company",
          role: session.user.user_metadata?.role || "HR Manager",
          password: "",
        };
        setUser(userData);
        localStorage.setItem("recruitai_user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("recruitai_user");
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("recruitai_user", JSON.stringify(userData));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    localStorage.removeItem("recruitai_user");
  };

  const signInWithGoogle = async () => {
    console.log('🚀 Starting Google sign-in...');
    
    // Force localhost for development, production URL for deployed app
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : window.location.origin;
    
    console.log('🌐 Redirect URL will be:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('❌ Error signing in with Google:', error);
      throw error;
    }
    
    console.log('✅ OAuth initiated:', data);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      session,
      isAuthenticated: !!session, 
      isLoading,
      login, 
      logout,
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
