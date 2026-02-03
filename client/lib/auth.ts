import { cookies } from 'next/headers';
import { AuthUser } from '@/types';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'rov_auth_token';

// Server-side function to get auth token from cookies
export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value || null;
}

// Server-side function to decode JWT and get user info
export async function getAuthUser(): Promise<AuthUser | null> {
    const token = await getAuthToken();
    if (!token) return null;

    try {
        // Decode JWT payload (base64)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            username: payload.username,
            role: payload.role,
        };
    } catch {
        return null;
    }
}

// Server-side function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
    const user = await getAuthUser();
    return user !== null;
}

// Client-side function to decode JWT
export function decodeToken(token: string): AuthUser | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            username: payload.username,
            role: payload.role,
        };
    } catch {
        return null;
    }
}
