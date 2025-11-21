import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt:', { username, password: '***' });

    if (username === 'admin' && password === 'admin') {
        console.log('Credentials valid, setting cookie...');
        const cookieStore = await cookies();

        cookieStore.set('auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
            sameSite: 'lax',
        });

        console.log('Cookie set successfully');
        console.log('NODE_ENV:', process.env.NODE_ENV);

        return NextResponse.json({ success: true });
    }

    console.log('Invalid credentials');
    return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
    );
}
