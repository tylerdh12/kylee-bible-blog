import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch site content for public pages (no auth required)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = searchParams.get('page');
		const section = searchParams.get('section');
		const key = searchParams.get('key');

		let where: any = {};
		if (key) {
			where.key = key;
		} else if (page) {
			where.page = page;
			if (section) {
				where.section = section;
			}
		}

		const content = await prisma.siteContent.findMany({
			where,
			orderBy: [
				{ page: 'asc' },
				{ section: 'asc' },
				{ order: 'asc' },
			],
		});

		// If requesting a single key, return just that content
		if (key && content.length > 0) {
			return NextResponse.json({ content: content[0] });
		}

		return NextResponse.json({ content });
	} catch (error) {
		console.error('Error fetching site content:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch site content' },
			{ status: 500 }
		);
	}
}
