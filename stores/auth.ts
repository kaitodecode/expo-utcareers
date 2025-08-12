import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    role: string | null;
    setToken: (token: string | null) => Promise<void>;
    setUser: (user: any) => Promise<void>;
    logout: () => Promise<void>;
}

const authStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    role: null,
    isAuthenticated: false,
    setToken: async (token) => {
        if (token) {
            await AsyncStorage.setItem('token', token);
        } else {
            await AsyncStorage.removeItem('token');
        }
        set({ token, isAuthenticated: !!token });
    },
    setUser: async (user) => {
        if (user) {
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
            await AsyncStorage.removeItem('user');
        }
        set({ user });
    },
    logout: async () => {
        await AsyncStorage.multiRemove(['token', 'user']);
        set({ token: null, user: null, isAuthenticated: false });
    },
}));

// Initialize store with stored values
const initializeAuth = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    const storedUser = await AsyncStorage.getItem('user');
    const storedRole = await AsyncStorage.getItem('role');
    if (storedRole) {
        authStore.setState({ role: storedRole });
    }



    if (storedToken) {
        authStore.setState({ token: storedToken, isAuthenticated: true });
    }
    if (storedUser) {
        authStore.setState({ user: JSON.parse(storedUser) });
    }
};

initializeAuth();

export const useAuth = authStore;
