import { NextResponse } from 'next/server';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'rov_auth_token';

export async function POST() {
    const res = NextResponse.json({ message: 'Logged out successfully' });

    // Clear the auth cookie
    res.cookies.set({
        name: COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
    });

    return res;
}
