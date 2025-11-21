import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Only protect POST, PUT, DELETE requests
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
        // Allow login and upload (upload might need auth too, let's protect it)
        if (request.nextUrl.pathname === '/api/auth/login') {
            return NextResponse.next();
        }

        const authCookie = request.cookies.get('auth');

        if (!authCookie || authCookie.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
