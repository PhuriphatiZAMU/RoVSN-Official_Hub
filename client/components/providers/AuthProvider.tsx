'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Type definitions
interface AuthUser {
    id: string;
    username: string;
    role: 'admin' | 'user';
}

interface LoginResult {
    success: boolean;
    error?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status by calling verify endpoint
    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                credentials: 'include', // Important: include cookies
            });

            if (response.ok) {
                const data = await response.json();
                if (data.valid && data.user) {
                    setUser({
                        id: data.user.id,
                        username: data.user.username,
                        role: data.user.role || 'user',
                    });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Run auth check on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login function - calls our API route which handles cookie setting
    const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
        try {
            setLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important: include cookies
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Login failed',
                };
            }

            // The cookie is set by the API route, now verify and get user data
            await checkAuth();

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Network error occurred',
            };
        } finally {
            setLoading(false);
        }
    }, [checkAuth]);

    // Logout function - calls our API route which clears the cookie
    const logout = useCallback(async () => {
        try {
            setLoading(true);

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, clear local state
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export type { AuthUser, AuthContextType };
