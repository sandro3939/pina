import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cognitoService, ForceChangePasswordError } from '@/lib/services/cognito';

export { ForceChangePasswordError };

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
  const [isLoading, setIsLoading] = useState(true);
  const [cognitoSub, setCognitoSub] = useState<string | null>(null);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const session = await cognitoService.getSession();
        if (session) {
          const user = await cognitoService.getCurrentUser();
          setCognitoSub(user?.userId ?? null);
          setIsAuthenticated(true);
        }
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const session = await cognitoService.signIn(email, password);
    const user = await cognitoService.getCurrentUser();
    setCognitoSub(user?.userId ?? null);
    setIsAuthenticated(true);
  };

  const completeNewPassword = async (newPassword: string) => {
    await cognitoService.completeNewPassword(newPassword);
    const user = await cognitoService.getCurrentUser();
    setCognitoSub(user?.userId ?? null);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await cognitoService.signOut();
    setCognitoSub(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, cognitoSub, signIn, completeNewPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
