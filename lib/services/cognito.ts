import { Amplify } from 'aws-amplify';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
  confirmSignIn,
  getCurrentUser,
} from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';
import { cognitoConfig } from '@/lib/config/cognito';

export class ForceChangePasswordError extends Error {
  constructor() {
    super('FORCE_CHANGE_PASSWORD');
    this.name = 'ForceChangePasswordError';
  }
}

interface AmplifySession {
  accessToken: string;
  idToken: string;
  isValid: () => boolean;
  getAccessToken: () => { getJwtToken: () => string };
  getIdToken: () => { getJwtToken: () => string; payload: Record<string, unknown> };
  getRefreshToken: () => { getToken: () => string };
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.clientId,
    },
  },
});

class CognitoAmplifyService {
  private currentSession: AmplifySession | null = null;
  private currentUser: AuthUser | null = null;

  async signIn(email: string, password: string): Promise<AmplifySession> {
    try {
      try { await amplifySignOut(); } catch { /* ignore stale state */ }

      const result = await amplifySignIn({ username: email, password });

      if (!result.isSignedIn &&
          result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        throw new ForceChangePasswordError();
      }

      const session = await this.fetchSession();
      this.currentUser = await getCurrentUser();
      return session;
    } catch (error: unknown) {
      if (error instanceof ForceChangePasswordError) throw error;

      const e = error as { name?: string; message?: string };
      if (e.name === 'NotAuthorizedException') throw new Error('Email o password non corretti.');
      if (e.name === 'UserNotFoundException') throw new Error('Utente non trovato.');
      if (e.name === 'UserNotConfirmedException') throw new Error('Account non verificato. Controlla la tua email.');
      if (e.message) throw new Error(e.message);
      throw new Error('Login fallito. Riprova più tardi.');
    }
  }

  async completeNewPassword(newPassword: string): Promise<AmplifySession> {
    await confirmSignIn({ challengeResponse: newPassword });
    const session = await this.fetchSession();
    this.currentUser = await getCurrentUser();
    return session;
  }

  async forgotPassword(email: string): Promise<void> {
    await resetPassword({ username: email });
  }

  async confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      this.currentUser = await getCurrentUser();
      return this.currentUser;
    } catch {
      this.currentUser = null;
      return null;
    }
  }

  async getSession(): Promise<AmplifySession | null> {
    try {
      return await this.fetchSession();
    } catch {
      return null;
    }
  }

  private async fetchSession(): Promise<AmplifySession> {
    const authSession = await fetchAuthSession();

    if (!authSession.tokens?.accessToken || !authSession.tokens?.idToken) {
      throw new Error('No tokens available');
    }

    const { accessToken, idToken } = authSession.tokens;

    const session: AmplifySession = {
      accessToken: accessToken.toString(),
      idToken: idToken.toString(),
      isValid: () => {
        const expiresAt = idToken.payload.exp as number;
        return Math.floor(Date.now() / 1000) < expiresAt;
      },
      getAccessToken: () => ({ getJwtToken: () => accessToken.toString() }),
      getIdToken: () => ({
        getJwtToken: () => idToken.toString(),
        payload: idToken.payload as Record<string, unknown>,
      }),
      getRefreshToken: () => ({
        getToken: () => (authSession.tokens as Record<string, unknown>)?.['refreshToken']?.toString() || '',
      }),
    };

    this.currentSession = session;
    return session;
  }

  async signOut(): Promise<void> {
    await amplifySignOut();
    this.currentSession = null;
    this.currentUser = null;
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await this.getSession();
      return session?.accessToken || null;
    } catch {
      return null;
    }
  }
}

export const cognitoService = new CognitoAmplifyService();
