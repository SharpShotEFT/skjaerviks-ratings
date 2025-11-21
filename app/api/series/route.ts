import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'SERIES' or 'ANIME'

    const where = type ? { type } : {};

    const series = await prisma.series.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(series);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, image, type, overallRating } = body;

        const series = await prisma.series.create({
            data: {
                title,
                image,
                type: type || 'SERIES',
                overallRating: overallRating ? parseFloat(overallRating) : null,
            },
        });

        return NextResponse.json(series);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
    }
}
