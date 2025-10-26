import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
	try {
		const tags = await prisma.tag.findMany({
			orderBy: {
				posts: {
					_count: 'desc',
				},
			},
			include: {
				_count: {
					select: {
						posts: true,
					},
				},
			},
		});

		return NextResponse.json({
			tags: tags.map(tag => ({
				id: tag.id,
				name: tag.name,
				postCount: tag._count.posts,
			})),
		});
	} catch (error) {
		console.error('Failed to fetch tags:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}