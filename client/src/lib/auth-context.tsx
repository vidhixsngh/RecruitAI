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
  // MOCK USER FOR BYPASS
  const mockUser: User = {
    id: "mock-user-id",
    username: "Demo User",
    email: "demo@recruitai.com",
    companyName: "RecruitAI Demo",
    role: "HR Manager",
    password: "",
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Set loading to false immediately

  // Bypass session check logic
  useEffect(() => {
    console.log("⚠️ Authentication Bypassed - Using Mock User");
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("recruitai_user", JSON.stringify(userData));
  };

  const logout = async () => {
    // await supabase.auth.signOut(); // Disable actual signout
    console.log("Logout clicked - but auth is bypassed");
    // setUser(null); // Keep user logged in
  };

  const signInWithGoogle = async () => {
    console.log("Sign in clicked - but auth is bypassed. You are already logged in.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      session, // session is null but we force isAuthenticated below
      isAuthenticated: true, // FORCE AUTHENTICATED
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
