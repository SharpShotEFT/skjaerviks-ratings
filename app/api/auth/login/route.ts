import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: Request) {
    const body = await request.json();
    const { username, password } = body;

    if (username === 'admin' && password === 'admin') {
        const cookie = serialize('auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return new NextResponse(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Set-Cookie': cookie },
        });
    }

    return new NextResponse(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
        status: 401,
    });
}
