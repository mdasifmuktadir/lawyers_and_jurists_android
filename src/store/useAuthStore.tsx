import { create } from "zustand";

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  profile_picture?: string;
  role?: string;
}




interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initial state: null means logged out
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
