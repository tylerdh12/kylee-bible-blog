import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { prisma } from '@/lib/db';

// GET - Fetch all site content or filter by page
export async function GET(request: NextRequest) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(user.role, 'read:content')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const page = searchParams.get('page');

		const where = page ? { page } : {};

		// Try to query the table - if it fails, return empty array
		let content;
		try {
			content = await prisma.siteContent.findMany({
				where,
				orderBy: [
					{ page: 'asc' },
					{ section: 'asc' },
					{ order: 'asc' },
				],
			});
		} catch (dbError: any) {
			// If table doesn't exist or other DB error, return empty array
			console.error('Database error fetching site content:', dbError);
			if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
				return NextResponse.json(
					{ 
						content: [],
						error: 'SiteContent table does not exist. Please run: npx prisma db push',
						code: 'TABLE_NOT_FOUND'
					},
					{ status: 200 } // Return 200 with empty array so UI can still work
				);
			}
			// For other errors, return empty array
			return NextResponse.json({ content: [] });
		}

		return NextResponse.json({ content });
	} catch (error: any) {
		console.error('Error in GET /api/admin/site-content:', error);
		console.error('Error details:', {
			message: error?.message,
			code: error?.code,
			stack: error?.stack,
		});
		
		// Return empty array instead of error so UI can still function
		return NextResponse.json({ 
			content: [],
			error: error?.message || 'Failed to fetch site content'
		});
	}
}

// POST - Create or update site content
export async function POST(request: NextRequest) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(user.role, 'write:content')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { key, page, section, title, content, contentType, order } = body;

		// Validation
		if (!key || !page || !section) {
			return NextResponse.json(
				{ error: 'Key, page, and section are required' },
				{ status: 400 }
			);
		}

		const siteContent = await prisma.siteContent.upsert({
			where: { key },
			update: {
				page,
				section,
				title: title || null,
				content: content || '',
				contentType: contentType || 'text',
				order: order || 0,
				updatedAt: new Date(),
			},
			create: {
				key,
				page,
				section,
				title: title || null,
				content: content || '',
				contentType: contentType || 'text',
				order: order || 0,
			},
		});

		return NextResponse.json({
			message: 'Site content saved successfully',
			content: siteContent,
		});
	} catch (error: any) {
		console.error('Error saving site content:', error);
		
		// Check if it's a table doesn't exist error
		if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
			return NextResponse.json(
				{ 
					error: 'SiteContent table does not exist. Please run: npx prisma db push',
					code: 'TABLE_NOT_FOUND'
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ 
				error: 'Failed to save site content',
				message: error?.message || 'Unknown error'
			},
			{ status: 500 }
		);
	}
}

// PATCH - Update site content
export const PATCH = POST;
