import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const movie = await prisma.movie.findUnique({
        where: { id: parseInt(id) },
    });

    if (!movie) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json(movie);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, image, rating } = body;

        const movie = await prisma.movie.update({
            where: { id: parseInt(id) },
            data: {
                title,
                image,
                rating: rating ? parseFloat(rating) : null,
            },
        });

        return NextResponse.json(movie);
    } catch (error) {
        console.error('Error updating movie:', error);
        return NextResponse.json(
            { error: 'Failed to update movie', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.movie.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting movie:', error);
        return NextResponse.json(
            { error: 'Failed to delete movie', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
