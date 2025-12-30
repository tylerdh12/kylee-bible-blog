import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import SettingsClient from './settings-client';
import { SettingsFormSkeleton } from '@/components/skeletons/admin-skeletons';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function getSettingValue(
	key: string,
	defaultValue: any,
	type: string = 'string'
) {
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

async function getSettings() {
	try {
		return {
			siteName: await getSettingValue('siteName', defaultSettings.siteName),
			siteDescription: await getSettingValue(
				'siteDescription',
				defaultSettings.siteDescription
			),
			siteUrl: await getSettingValue('siteUrl', defaultSettings.siteUrl),
			adminEmail: await getSettingValue(
				'adminEmail',
				defaultSettings.adminEmail
			),
			allowComments: await getSettingValue(
				'allowComments',
				defaultSettings.allowComments,
				'boolean'
			),
			allowPrayerRequests: await getSettingValue(
				'allowPrayerRequests',
				defaultSettings.allowPrayerRequests,
				'boolean'
			),
			allowDonations: await getSettingValue(
				'allowDonations',
				defaultSettings.allowDonations,
				'boolean'
			),
			maintenanceMode: await getSettingValue(
				'maintenanceMode',
				defaultSettings.maintenanceMode,
				'boolean'
			),
		};
	} catch (error) {
		console.error('Error fetching settings:', error);
		return defaultSettings;
	}
}

async function getSystemStatus() {
	try {
		// Check database connection
		await prisma.$queryRaw`SELECT 1`;
		const databaseStatus: 'connected' | 'disconnected' = 'connected';

		// API is healthy if we got here
		const apiStatus: 'healthy' | 'unhealthy' = 'healthy';

		return {
			database: databaseStatus,
			api: apiStatus,
			version: '0.1.0',
			environment: process.env.NODE_ENV || 'development',
		};
	} catch (error) {
		console.error('Error checking system status:', error);
		return {
			database: 'disconnected' as const,
			api: 'unhealthy' as const,
			version: '0.1.0',
			environment: process.env.NODE_ENV || 'development',
		};
	}
}

export default async function SettingsPage() {
	// Verify authentication and ADMIN role server-side
	const { error, user } = await requireAdmin();
	if (error || !user) {
		redirect('/admin');
	}

	// Fetch settings and system status server-side
	const [settings, systemStatus] = await Promise.all([
		getSettings(),
		getSystemStatus(),
	]);

	return (
		<Suspense fallback={<SettingsFormSkeleton />}>
			<SettingsClient
				initialSettings={settings}
				systemStatus={systemStatus}
			/>
		</Suspense>
	);
}
