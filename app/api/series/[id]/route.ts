import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const series = await prisma.series.findUnique({
        where: { id: parseInt(id) },
        include: {
            seasons: {
                include: {
                    episodes: {
                        orderBy: { episodeNumber: 'asc' },
                    },
                },
                orderBy: { seasonNumber: 'asc' },
            },
        },
    });

    if (!series) {
        return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json(series);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, image, overallRating } = body;

        const series = await prisma.series.update({
            where: { id: parseInt(id) },
            data: {
                title,
                image,
                overallRating: overallRating ? parseFloat(overallRating) : null,
            },
        });

        return NextResponse.json(series);
    } catch (error) {
        console.error('Error updating series:', error);
        return NextResponse.json(
            { error: 'Failed to update series', details: error instanceof Error ? error.message : 'Unknown error' },
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
        // Prisma will cascade delete seasons and episodes automatically
        await prisma.series.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting series:', error);
        return NextResponse.json(
            { error: 'Failed to delete series', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
