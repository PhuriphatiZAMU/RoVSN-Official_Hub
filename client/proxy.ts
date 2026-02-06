import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'rov_auth_token';

// Paths that require authentication
const protectedPaths = ['/admin'];

// Paths that should redirect to admin if already authenticated
const authPaths = ['/login'];

export function proxy(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const { pathname } = request.nextUrl;

    // Check if this is a protected route
    const isProtectedRoute = protectedPaths.some(path =>
        pathname.startsWith(path)
    );

    // Check if this is an auth route (login)
    const isAuthRoute = authPaths.some(path =>
        pathname === path
    );

    // If protected route and no token, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If on login page and has valid token, redirect to admin
    if (isAuthRoute && token) {
        // Verify token is not expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        } catch {
            // Invalid token, allow access to login
        }
    }

    return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
    matcher: [
        '/admin/:path*',
        '/login',
    ],
};
