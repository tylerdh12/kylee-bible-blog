import { prisma } from './db';

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

/**
 * Get all site settings from database
 * Cached for performance - settings don't change frequently
 */
let settingsCache: typeof defaultSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

export async function getSiteSettings() {
	const now = Date.now();
	
	// Return cached settings if still valid
	if (settingsCache && (now - cacheTimestamp) < CACHE_TTL) {
		return settingsCache;
	}

	try {
		// Fetch all settings in a single query instead of 8 separate queries
		const settingKeys = [
			'siteName',
			'siteDescription',
			'siteUrl',
			'adminEmail',
			'allowComments',
			'allowPrayerRequests',
			'allowDonations',
			'maintenanceMode',
		];

		const settingsData = await prisma.setting.findMany({
			where: {
				key: { in: settingKeys },
			},
		});

		// Create a map for quick lookup
		const settingsMap = new Map(
			settingsData.map((s) => [s.key, s.value])
		);

		// Helper to get value with type conversion
		const getValue = (key: string, defaultValue: any, type: string = 'string') => {
			const value = settingsMap.get(key);
			if (!value) return defaultValue;

			switch (type) {
				case 'boolean':
					return value === 'true';
				case 'number':
					return parseFloat(value || '0');
				case 'json':
					return JSON.parse(value || 'null');
				default:
					return value || defaultValue;
			}
		};

		const settings = {
			siteName: getValue('siteName', defaultSettings.siteName),
			siteDescription: getValue(
				'siteDescription',
				defaultSettings.siteDescription
			),
			siteUrl: getValue('siteUrl', defaultSettings.siteUrl),
			adminEmail: getValue('adminEmail', defaultSettings.adminEmail),
			allowComments: getValue(
				'allowComments',
				defaultSettings.allowComments,
				'boolean'
			),
			allowPrayerRequests: getValue(
				'allowPrayerRequests',
				defaultSettings.allowPrayerRequests,
				'boolean'
			),
			allowDonations: getValue(
				'allowDonations',
				defaultSettings.allowDonations,
				'boolean'
			),
			maintenanceMode: getValue(
				'maintenanceMode',
				defaultSettings.maintenanceMode,
				'boolean'
			),
		};

		// Update cache
		settingsCache = settings;
		cacheTimestamp = now;

		return settings;
	} catch (error) {
		console.error('Error fetching site settings:', error);
		return defaultSettings;
	}
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache() {
	settingsCache = null;
	cacheTimestamp = 0;
}

/**
 * Check if a specific feature is enabled
 */
export async function isFeatureEnabled(feature: 'comments' | 'prayerRequests' | 'donations'): Promise<boolean> {
	const settings = await getSiteSettings();
	
	switch (feature) {
		case 'comments':
			return settings.allowComments;
		case 'prayerRequests':
			return settings.allowPrayerRequests;
		case 'donations':
			return settings.allowDonations;
		default:
			return false;
	}
}

/**
 * Check if maintenance mode is enabled
 * Bypasses cache for immediate updates
 */
export async function isMaintenanceMode(): Promise<boolean> {
	try {
		// Bypass cache for maintenance mode to ensure immediate effect
		const maintenanceMode = await getSettingValue(
			'maintenanceMode',
			defaultSettings.maintenanceMode,
			'boolean'
		);
		return maintenanceMode;
	} catch (error) {
		console.error('Error checking maintenance mode:', error);
		return false;
	}
}
