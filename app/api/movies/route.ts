import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    const movies = await prisma.movie.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(movies);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, image, rating } = body;

        const movie = await prisma.movie.create({
            data: {
                title,
                image,
                rating: rating ? parseFloat(rating) : null,
            },
        });

        return NextResponse.json(movie);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
    }
}
