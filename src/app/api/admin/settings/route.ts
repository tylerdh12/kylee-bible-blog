import { NextRequest, NextResponse } from 'next/server';
import { requirePermissions } from '@/lib/rbac';
import { prisma } from '@/lib/db';

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

async function getSettingValue(key: string, defaultValue: any, type: string = 'string') {
	try {
		const setting = await prisma.setting.findUnique({ where: { key } });
		if (!setting) return defaultValue;

		switch (type) {
			case 'boolean':
				return setting.value === 'true';
			case 'number':
				return parseFloat(setting.value || '0');
			case 'json':
				return JSON.parse(setting.value || 'null');
			default:
				return setting.value || defaultValue;
		}
	} catch (error) {
		console.error(`Error getting setting ${key}:`, error);
		return defaultValue;
	}
}

async function setSettingValue(key: string, value: any, type: string = 'string', description?: string) {
	try {
		let stringValue: string;
		switch (type) {
			case 'boolean':
				stringValue = value ? 'true' : 'false';
				break;
			case 'number':
				stringValue = value.toString();
				break;
			case 'json':
				stringValue = JSON.stringify(value);
				break;
			default:
				stringValue = value?.toString() || '';
		}

		await prisma.setting.upsert({
			where: { key },
			update: { value: stringValue, updatedAt: new Date() },
			create: { key, value: stringValue, type, description },
		});
	} catch (error) {
		console.error(`Error setting ${key}:`, error);
		throw error;
	}
}

// GET - Fetch current settings
export async function GET(request: NextRequest) {
	try {
		const authCheck = await requirePermissions('admin:settings')();
		if (authCheck instanceof NextResponse) return authCheck;

		const settings = {
			siteName: await getSettingValue('siteName', defaultSettings.siteName),
			siteDescription: await getSettingValue('siteDescription', defaultSettings.siteDescription),
			siteUrl: await getSettingValue('siteUrl', defaultSettings.siteUrl),
			adminEmail: await getSettingValue('adminEmail', defaultSettings.adminEmail),
			allowComments: await getSettingValue('allowComments', defaultSettings.allowComments, 'boolean'),
			allowPrayerRequests: await getSettingValue('allowPrayerRequests', defaultSettings.allowPrayerRequests, 'boolean'),
			allowDonations: await getSettingValue('allowDonations', defaultSettings.allowDonations, 'boolean'),
			maintenanceMode: await getSettingValue('maintenanceMode', defaultSettings.maintenanceMode, 'boolean'),
		};

		return NextResponse.json({ settings });
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
		const authCheck = await requirePermissions('admin:settings')();
		if (authCheck instanceof NextResponse) return authCheck;

		const body = await request.json();
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

		// Save all settings to database
		const settingsToSave = [
			{ key: 'siteName', value: siteName, type: 'string', description: 'Site name' },
			{ key: 'siteDescription', value: siteDescription, type: 'string', description: 'Site description' },
			{ key: 'siteUrl', value: siteUrl, type: 'string', description: 'Site URL' },
			{ key: 'adminEmail', value: adminEmail, type: 'string', description: 'Administrator email' },
			{ key: 'allowComments', value: allowComments, type: 'boolean', description: 'Allow comments on posts' },
			{ key: 'allowPrayerRequests', value: allowPrayerRequests, type: 'boolean', description: 'Allow prayer requests' },
			{ key: 'allowDonations', value: allowDonations, type: 'boolean', description: 'Allow donations' },
			{ key: 'maintenanceMode', value: maintenanceMode, type: 'boolean', description: 'Maintenance mode' },
		];

		for (const setting of settingsToSave) {
			if (setting.value !== undefined) {
				await setSettingValue(setting.key, setting.value, setting.type, setting.description);
			}
		}

		// Return updated settings
		const updatedSettings = {
			siteName: await getSettingValue('siteName', defaultSettings.siteName),
			siteDescription: await getSettingValue('siteDescription', defaultSettings.siteDescription),
			siteUrl: await getSettingValue('siteUrl', defaultSettings.siteUrl),
			adminEmail: await getSettingValue('adminEmail', defaultSettings.adminEmail),
			allowComments: await getSettingValue('allowComments', defaultSettings.allowComments, 'boolean'),
			allowPrayerRequests: await getSettingValue('allowPrayerRequests', defaultSettings.allowPrayerRequests, 'boolean'),
			allowDonations: await getSettingValue('allowDonations', defaultSettings.allowDonations, 'boolean'),
			maintenanceMode: await getSettingValue('maintenanceMode', defaultSettings.maintenanceMode, 'boolean'),
		};

		return NextResponse.json({
			message: 'Settings saved successfully',
			settings: updatedSettings,
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
