import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const auth = cookieStore.get('auth');
    const isAuthenticated = auth?.value === 'true';

    return NextResponse.json({ isAuthenticated });
}
