import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists and is valid
        const savedToken = sessionStorage.getItem('token');
        if (savedToken) {
            // Verify token (decode and check expiry)
            try {
                const payload = JSON.parse(atob(savedToken.split('.')[1]));
                if (payload.exp * 1000 > Date.now()) {
                    setToken(savedToken);
                    setUser({ username: payload.username, role: payload.role });
                } else {
                    // Token expired
                    sessionStorage.removeItem('token');
                    setToken(null);
                }
            } catch {
                sessionStorage.removeItem('token');
                setToken(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await apiLogin(username, password);
            const { token: newToken } = response;

            sessionStorage.setItem('token', newToken);
            setToken(newToken);

            // Decode user from token
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            setUser({ username: payload.username, role: payload.role });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
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
