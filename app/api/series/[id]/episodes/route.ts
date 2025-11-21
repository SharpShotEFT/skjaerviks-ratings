import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const seriesId = parseInt(params.id);
        const body = await request.json();
        const { seasonNumber, episodeNumber, title, rating } = body;

        // Find or create season
        let season = await prisma.season.findFirst({
            where: {
                seriesId,
                seasonNumber: parseInt(seasonNumber),
            },
        });

        if (!season) {
            season = await prisma.season.create({
                data: {
                    seriesId,
                    seasonNumber: parseInt(seasonNumber),
                },
            });
        }

        // Create episode
        const episode = await prisma.episode.create({
            data: {
                seasonId: season.id,
                episodeNumber: parseInt(episodeNumber),
                title,
                rating: rating ? parseFloat(rating) : null,
            },
        });

        return NextResponse.json(episode);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add episode' }, { status: 500 });
    }
}
