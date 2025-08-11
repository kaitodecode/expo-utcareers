import { create } from 'zustand';
interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setUser: (user: any) => void;
}

const authStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    setToken: (token) => set({ token, isAuthenticated: !!token }),
    setUser: (user) => set({ user }),
}));
export const useAuth = authStore;
