import { NextRequest, NextResponse } from 'next/server';

// For server-side API proxy, use the backend server URL
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to handle proxy requests
async function handleProxy(
    request: NextRequest,
    pathSegments: string[],
    method: string
) {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const backendUrl = `${API_URL}/${path}${url.search}`;

    try {
        // Forward headers, especially Authorization
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        let body: BodyInit | null = null;

        // Handle different content types
        const contentType = request.headers.get('content-type');
        if (method !== 'GET' && method !== 'HEAD') {
            if (contentType?.includes('multipart/form-data')) {
                // For file uploads, pass through the body array buffer
                // Note: Fetch might need specific handling for FormData boundaries if not handled automatically
                body = await request.arrayBuffer();
                // Don't set Content-Type for multipart, let fetch set boundary
                // But we need to be careful here. 
                // Simple JSON proxying is safer to start.
                // If uploading files, we might need a more robust stream proxy.
                // For now, let's stick to JSON which is 99% of use cases here.
            } else {
                // JSON body
                const jsonBody = await request.json().catch(() => null);
                if (jsonBody) {
                    body = JSON.stringify(jsonBody);
                }
            }
        }

        // Forward request to backend
        const response = await fetch(backendUrl, {
            method,
            headers,
            body,
            // crucial for self-signed certs or some internal networks, but on Vercel/Render standard HTTPS is fine
        });

        // Get response body
        const responseData = await response.json().catch(() => ({}));

        return NextResponse.json(responseData, { status: response.status });

    } catch (error) {
        console.error(`Proxy Error [${method} ${path}]:`, error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}

// Export route handlers dynamically
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'PUT');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'DELETE');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'PATCH');
}
