import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'rov_auth_token';

export async function GET(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json(
            { valid: false, error: 'No token found' },
            { status: 200 }
        );
    }

    try {
        // Decode the JWT payload
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
            // Clear expired cookie
            const res = NextResponse.json(
                { valid: false, error: 'Token expired' },
                { status: 200 }
            );
            res.cookies.set({
                name: COOKIE_NAME,
                value: '',
                maxAge: 0,
                path: '/',
            });
            return res;
        }

        return NextResponse.json({
            valid: true,
            user: {
                username: payload.username,
                role: payload.role,
            },
        });
    } catch {
        return NextResponse.json(
            { valid: false, error: 'Invalid token' },
            { status: 200 }
        );
    }
}
