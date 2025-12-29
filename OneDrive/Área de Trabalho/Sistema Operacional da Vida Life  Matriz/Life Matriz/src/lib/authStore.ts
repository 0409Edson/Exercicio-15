import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcryptjs from 'bcryptjs';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

interface AuthState {
    isAuthenticated: boolean;
    user: AuthUser | null;
    passwordHash: string | null;
    pin: string | null;
    isFirstTime: boolean;
    lastActivity: Date | null;
    sessionTimeout: number; // minutes

    // Actions
    setupPassword: (password: string, userName: string, email?: string) => Promise<boolean>;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    setupPin: (pin: string) => void;
    verifyPin: (pin: string) => boolean;
    updateUser: (updates: Partial<AuthUser>) => void;
    checkSession: () => boolean;
    updateActivity: () => void;
}

// Simple hash function for demo (in production use bcrypt on server)
const simpleHash = async (password: string): Promise<string> => {
    // Using a simple hash for client-side demo
    // In production, this should be done server-side with bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'lifeos-salt-2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyHash = async (password: string, hash: string): Promise<boolean> => {
    const newHash = await simpleHash(password);
    return newHash === hash;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            passwordHash: null,
            pin: null,
            isFirstTime: true,
            lastActivity: null,
            sessionTimeout: 30, // 30 minutes default

            setupPassword: async (password: string, userName: string, email?: string) => {
                try {
                    const hash = await simpleHash(password);
                    const user: AuthUser = {
                        id: 'user-' + Date.now(),
                        name: userName,
                        email: email || '',
                        createdAt: new Date(),
                    };

                    set({
                        passwordHash: hash,
                        user,
                        isFirstTime: false,
                        isAuthenticated: true,
                        lastActivity: new Date(),
                    });

                    return true;
                } catch (error) {
                    console.error('Error setting up password:', error);
                    return false;
                }
            },

            login: async (password: string) => {
                const { passwordHash } = get();

                if (!passwordHash) {
                    return false;
                }

                const isValid = await verifyHash(password, passwordHash);

                if (isValid) {
                    set({
                        isAuthenticated: true,
                        lastActivity: new Date(),
                    });
                    return true;
                }

                return false;
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    lastActivity: null,
                });
            },

            setupPin: (pin: string) => {
                set({ pin });
            },

            verifyPin: (pin: string) => {
                const { pin: storedPin } = get();
                if (storedPin === pin) {
                    set({
                        isAuthenticated: true,
                        lastActivity: new Date(),
                    });
                    return true;
                }
                return false;
            },

            updateUser: (updates: Partial<AuthUser>) => {
                const { user } = get();
                if (user) {
                    set({
                        user: { ...user, ...updates },
                    });
                }
            },

            checkSession: () => {
                const { lastActivity, sessionTimeout, isAuthenticated } = get();

                if (!isAuthenticated || !lastActivity) {
                    return false;
                }

                const now = new Date();
                const lastActivityDate = new Date(lastActivity);
                const diffMinutes = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60);

                if (diffMinutes > sessionTimeout) {
                    set({ isAuthenticated: false });
                    return false;
                }

                return true;
            },

            updateActivity: () => {
                set({ lastActivity: new Date() });
            },
        }),
        {
            name: 'lifeos-auth',
        }
    )
);
