import { NextRequest, NextResponse } from 'next/server';
import { requirePermissions } from '@/lib/rbac';

// In a real app, you'd store settings in the database
// For now, we'll use a simple in-memory store or environment variables
const defaultSettings = {
	siteName: "Kylee's Blog",
	siteDescription:
		"Follow Kylee's Bible study journey, support her goals, and join her community.",
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
	adminEmail: process.env.ADMIN_EMAIL || '',
	allowComments: true,
	allowPrayerRequests: true,
	allowDonations: true,
	maintenanceMode: false,
};

// GET - Fetch current settings
export async function GET(request: NextRequest) {
	try {
		const authCheck = await requirePermissions('manage:settings')();
		if (authCheck instanceof NextResponse) return authCheck;

		// In production, you'd fetch from database
		// For now, return default settings
		return NextResponse.json({
			settings: defaultSettings,
		});
	} catch (error) {
		console.error('Error fetching settings:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch settings' },
			{ status: 500 }
		);
	}
}

// POST/PATCH - Update settings
export async function POST(request: NextRequest) {
	try {
		const authCheck = await requirePermissions('manage:settings')();
		if (authCheck instanceof NextResponse) return authCheck;

		const body = await request.json();

		// In production, you'd save to database
		// For now, we'll just validate and return success
		const {
			siteName,
			siteDescription,
			siteUrl,
			adminEmail,
			allowComments,
			allowPrayerRequests,
			allowDonations,
			maintenanceMode,
		} = body;

		// Basic validation
		if (siteName && siteName.trim().length === 0) {
			return NextResponse.json(
				{ error: 'Site name is required' },
				{ status: 400 }
			);
		}

		if (adminEmail && !adminEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			return NextResponse.json(
				{ error: 'Invalid email address' },
				{ status: 400 }
			);
		}

		// In production: Save to database
		// await prisma.settings.upsert({...})

		return NextResponse.json({
			message: 'Settings saved successfully',
			settings: {
				siteName: siteName || defaultSettings.siteName,
				siteDescription:
					siteDescription || defaultSettings.siteDescription,
				siteUrl: siteUrl || defaultSettings.siteUrl,
				adminEmail: adminEmail || defaultSettings.adminEmail,
				allowComments:
					allowComments !== undefined
						? allowComments
						: defaultSettings.allowComments,
				allowPrayerRequests:
					allowPrayerRequests !== undefined
						? allowPrayerRequests
						: defaultSettings.allowPrayerRequests,
				allowDonations:
					allowDonations !== undefined
						? allowDonations
						: defaultSettings.allowDonations,
				maintenanceMode:
					maintenanceMode !== undefined
						? maintenanceMode
						: defaultSettings.maintenanceMode,
			},
		});
	} catch (error) {
		console.error('Error saving settings:', error);
		return NextResponse.json(
			{ error: 'Failed to save settings' },
			{ status: 500 }
		);
	}
}

export const PATCH = POST;
