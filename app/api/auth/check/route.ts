import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const auth = cookieStore.get('auth');
    const isAuthenticated = auth?.value === 'true';

    console.log('Auth check - Cookie value:', auth?.value);
    console.log('Auth check - isAuthenticated:', isAuthenticated);

    return NextResponse.json({ isAuthenticated });
}
