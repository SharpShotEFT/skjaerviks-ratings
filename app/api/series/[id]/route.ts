import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);

    const series = await prisma.series.findUnique({
        where: { id },
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
