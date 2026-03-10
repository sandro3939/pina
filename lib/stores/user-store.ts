import { create } from 'zustand';

export interface UserData {
  id: string;
  cognitoSub: string;
  email: string;
  firstName: string;
  lastName: string;
  familyId: string;
}

interface UserStore {
  currentUser: UserData | null;
  cognitoSub: string | null;
  isLoading: boolean;
  error: string | null;

  setCurrentUser: (user: UserData | null) => void;
  setCognitoSub: (sub: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  cognitoSub: null,
  isLoading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user, error: null }),
  setCognitoSub: (sub) => set({ cognitoSub: sub }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearUser: () => set({ currentUser: null, cognitoSub: null, isLoading: false, error: null }),
}));
