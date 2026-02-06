import { NextRequest, NextResponse } from 'next/server';

// For server-side API routes, use the internal API URL or relative path
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'rov_auth_token';
const COOKIE_MAX_AGE = parseInt(process.env.JWT_COOKIE_MAX_AGE || '86400', 10); // 24 hours default

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Forward the login request to the Express backend
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Login failed' },
                { status: response.status }
            );
        }

        // Extract the token from the backend response
        const { token, ...rest } = data;

        // Create the response
        const res = NextResponse.json({
            ...rest,
            message: 'Login successful',
        });

        // Set the JWT as an HTTP-only cookie
        res.cookies.set({
            name: COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        });

        return res;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
