import { signInWithEmailAndPassword } from "firebase/auth";
import { create } from "zustand";
import { auth } from "./lib/firebase";

interface AuthState {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  login: async (email: string, password: string) => {
    const user = await signInWithEmailAndPassword(auth, email, password);
    if (user) {
      set({ isLoggedIn: true });
    }
  },
  logout: () => set({ isLoggedIn: false }),
}));
