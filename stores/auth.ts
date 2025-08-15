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
    login: (token: string, user: any) => Promise<void>;

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
            // Set role when setting user
            if (user.role) {
                await AsyncStorage.setItem('role', user.role);
                set({ user, role: user.role });
                return;
            }
        } else {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('role');
        }
        set({ user });
    },
    login: async (token, user) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        if (user.role) {
            await AsyncStorage.setItem('role', user.role);
            set({ token, user, role: user.role, isAuthenticated: true });
            return;
        }
        set({ token, user, isAuthenticated: true });
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['token', 'user', 'role']);
        set({ token: null, user: null, role: null, isAuthenticated: false });
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
