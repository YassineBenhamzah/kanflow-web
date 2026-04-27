import { create } from 'zustand';
import axios from '../lib/axios';

// Building the global brain (No more TypeScript interfaces!)
export const useAuth = create((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: true,
    
    login: (token, user) => {
        if (typeof window !== 'undefined') localStorage.setItem('token', token);
        set({ token, user });
    },
    
    logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        set({ token: null, user: null });
    },
    
    checkAuth: async () => {
        try {
            set({ isLoading: true });
            const response = await axios.get('/auth/me');
            set({ user: response.data, isLoading: false });
        } catch (error) {
            if (typeof window !== 'undefined') localStorage.removeItem('token');
            set({ user: null, token: null, isLoading: false });
        }
    }
}));
