import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  cognitoSub: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    // Static login — accetta qualsiasi credenziale
    await new Promise((r) => setTimeout(r, 400));
    setIsAuthenticated(true);
  };

  const completeNewPassword = async (_newPassword: string) => {};

  const signOut = async () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        cognitoSub: isAuthenticated ? 'static-user-id' : null,
        signIn,
        completeNewPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export class ForceChangePasswordError extends Error {}
