import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-new';
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
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'Database error fetching site content:',
					dbError
				);
			}
			if (
				dbError?.code === 'P2021' ||
				dbError?.message?.includes('does not exist')
			) {
				return NextResponse.json(
					{
						content: [],
						error: 'Content unavailable',
						code: 'TABLE_NOT_FOUND',
					},
					{ status: 200 } // Return 200 with empty array so UI can still work
				);
			}
			// For other errors, return empty array
			return NextResponse.json({ content: [] });
		}

		return NextResponse.json({ content });
	} catch (error: any) {
		if (process.env.NODE_ENV === 'development') {
			console.error(
				'Error in GET /api/admin/site-content:',
				error
			);
		}

		// Return empty array instead of error so UI can still function
		return NextResponse.json({
			content: [],
			error: 'Failed to fetch site content',
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

		let body;
		try {
			body = await request.json();
		} catch (parseError: any) {
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'[API] Failed to parse request body:',
					parseError
				);
			}
			return NextResponse.json(
				{
					error: 'Invalid request format',
				},
				{ status: 400 }
			);
		}

		const {
			key,
			page,
			section,
			title,
			content,
			contentType,
			order,
		} = body;

		// Validation
		if (!key || !page || !section) {
			if (process.env.NODE_ENV === 'development') {
				console.error('[API] Validation failed:', {
					key,
					page,
					section,
				});
			}
			return NextResponse.json(
				{ error: 'Key, page, and section are required' },
				{ status: 400 }
			);
		}

		// Use nullish coalescing to preserve empty strings and null values
		const contentToSave = content ?? '';
		const titleToSave = title ?? null;
		const contentTypeToSave = contentType || 'text';
		const orderToSave = order || 0;

		let siteContent;
		try {
			siteContent = await prisma.siteContent.upsert({
				where: { key },
				update: {
					page,
					section,
					title: titleToSave,
					content: contentToSave, // Preserve empty strings
					contentType: contentTypeToSave,
					order: orderToSave,
					// updatedAt is automatically managed by Prisma with @updatedAt
				},
				create: {
					key,
					page,
					section,
					title: titleToSave,
					content: contentToSave, // Preserve empty strings
					contentType: contentTypeToSave,
					order: orderToSave,
				},
			});
		} catch (dbError: any) {
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'[API] Database error during upsert:',
					dbError
				);
			}

			// Re-throw to be caught by outer catch block
			throw dbError;
		}

		return NextResponse.json({
			message: 'Site content saved successfully',
			content: siteContent,
		});
	} catch (error: any) {
		// Log error details only in development
		if (process.env.NODE_ENV === 'development') {
			console.error(
				'[API] Error saving site content:',
				error
			);
		}

		// Check if it's a table doesn't exist error
		if (
			error?.code === 'P2021' ||
			error?.message?.includes('does not exist')
		) {
			return NextResponse.json(
				{
					error: 'Content service unavailable',
					code: 'TABLE_NOT_FOUND',
				},
				{ status: 500 }
			);
		}

		// Check for Prisma validation errors
		if (error?.code === 'P2002') {
			return NextResponse.json(
				{
					error: 'Duplicate content key',
					code: 'DUPLICATE_KEY',
				},
				{ status: 400 }
			);
		}

		// Check for connection errors
		if (
			error?.code === 'P1001' ||
			error?.message?.includes('connect') ||
			error?.message?.includes('connection')
		) {
			return NextResponse.json(
				{
					error: 'Service temporarily unavailable',
					code: 'DB_CONNECTION_ERROR',
				},
				{ status: 500 }
			);
		}

		// Generic error response - always ensure it's valid JSON
		try {
			return NextResponse.json(
				{
					error: 'Failed to save site content',
				},
				{ status: 500 }
			);
		} catch (jsonError) {
			// Fallback if JSON serialization fails
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'[API] Failed to serialize error response:',
					jsonError
				);
			}
			return new NextResponse(
				JSON.stringify({
					error: 'Internal server error',
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}
	}
}

// PATCH - Update site content
export const PATCH = POST;
