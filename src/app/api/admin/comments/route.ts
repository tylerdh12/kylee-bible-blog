import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermissionsRouteHandler } from '@/lib/rbac';

// GET - List all comments for moderation
export async function GET(request: NextRequest) {
	try {
		const authCheck = await requirePermissionsRouteHandler('read:comments');
		if (authCheck) return authCheck;

		const { searchParams } = new URL(request.url);
		const approved = searchParams.get('approved');
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(
			searchParams.get('limit') || '20'
		);
		const skip = (page - 1) * limit;

		let whereClause = {};
		if (approved === 'true') {
			whereClause = { isApproved: true };
		} else if (approved === 'false') {
			whereClause = { isApproved: false };
		}

		const [comments, total] = await Promise.all([
			prisma.comment.findMany({
				where: whereClause,
				include: {
					author: {
						select: {
							id: true,
							name: true,
							email: true,
							avatar: true,
							role: true,
						},
					},
					post: {
						select: {
							id: true,
							title: true,
							slug: true,
						},
					},
					parent: {
						select: {
							id: true,
							content: true,
							author: {
								select: {
									name: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			prisma.comment.count({ where: whereClause }),
		]);

		return NextResponse.json({
			comments,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching comments:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch comments' },
			{ status: 500 }
		);
	}
}
