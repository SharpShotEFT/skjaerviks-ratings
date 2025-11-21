import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

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

        console.log('Creating movie:', { title, image, rating });

        const movie = await prisma.movie.create({
            data: {
                title,
                image,
                rating: rating ? parseFloat(rating) : null,
            },
        });

        console.log('Movie created successfully:', movie);
        return NextResponse.json(movie);
    } catch (error) {
        console.error('Error creating movie:', error);
        return NextResponse.json({
            error: 'Failed to create movie',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
