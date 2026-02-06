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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rov-sn-tournament-api.onrender.com/api';

    // Helper to get token
    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Check authentication status by calling verify endpoint
    const checkAuth = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.valid && data.user) {
                    setUser({
                        id: data.user.id || 'admin',
                        username: data.user.username || 'admin',
                        role: data.user.role || 'admin',
                    });
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Don't clear token on network error immediately, but user state is null
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function - calls our API route
    const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Login failed',
                };
            }

            // Save token to localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Manually set user state immediately to avoid waiting for verify roundtrip if possible
                // but checkAuth is safer
                await checkAuth();
                return { success: true };
            } else {
                return { success: false, error: 'No token received' };
            }

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

    // Logout function
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            // Optional: Call logout endpoint if backend needs it (mostly for cookies)
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
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
