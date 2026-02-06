import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'rov_auth_token';
// For server-side API proxy, use the internal API URL or relative path
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

// Proxy handler for admin API calls that need authentication
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams.path, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams.path, 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams.path, 'DELETE');
}

async function handleProxy(
    request: NextRequest,
    pathSegments: string[],
    method: string
) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const apiUrl = `${API_URL}/${path}${url.search}`;

    try {
        const headers: HeadersInit = {
            'Authorization': `Bearer ${token}`,
        };

        let body: BodyInit | null = null;

        // Handle different content types
        const contentType = request.headers.get('content-type');
        if (method !== 'GET' && method !== 'HEAD') {
            if (contentType?.includes('multipart/form-data')) {
                // For file uploads, pass through the body
                body = await request.arrayBuffer();
                headers['Content-Type'] = contentType;
            } else {
                // JSON body
                const jsonBody = await request.json().catch(() => null);
                if (jsonBody) {
                    body = JSON.stringify(jsonBody);
                    headers['Content-Type'] = 'application/json';
                }
            }
        }

        const response = await fetch(apiUrl, {
            method,
            headers,
            body,
        });

        const data = await response.json().catch(() => ({}));

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
