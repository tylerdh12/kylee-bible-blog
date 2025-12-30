import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/settings';
import PrayerRequestsClient from './prayer-requests-client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSiteContent(page: string) {
	try {
		const content = await prisma.siteContent.findMany({
			where: { page },
			orderBy: [{ section: 'asc' }, { order: 'asc' }],
		});

		const contentMap: Record<string, string> = {};
		content.forEach((item) => {
			// Store content even if it's an empty string - use nullish coalescing to preserve empty strings
			contentMap[item.key] = item.content ?? '';
		});

		// Debug logging in development
		if (process.env.NODE_ENV === 'development') {
			console.log(`[getSiteContent] Fetched ${content.length} items for page "${page}"`);
			console.log(`[getSiteContent] Content keys:`, Object.keys(contentMap));
			if (content.length > 0) {
				console.log(`[getSiteContent] Sample content:`, content.slice(0, 3).map(c => ({ key: c.key, content: c.content?.substring(0, 50) })));
			}
		}

		return contentMap;
	} catch (error: any) {
		// Silently handle errors - defaults will be used
		if (error?.code !== 'P2021' && !error?.message?.includes('does not exist')) {
			console.error('Error fetching site content:', error);
		}
		return {};
	}
}

export default async function PrayerRequestsPage() {
	const enabled = await isFeatureEnabled('prayerRequests');
	const siteContent = await getSiteContent('prayer-requests');

	// Debug logging in development
	if (process.env.NODE_ENV === 'development') {
		console.log('[Prayer Requests Page] Site content keys:', Object.keys(siteContent));
		console.log('[Prayer Requests Page] Title from DB:', siteContent['prayer-requests.title']);
		console.log('[Prayer Requests Page] Description from DB:', siteContent['prayer-requests.description']);
	}

	return <PrayerRequestsClient enabled={enabled} siteContent={siteContent} />;
}
