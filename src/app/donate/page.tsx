import { Suspense } from 'react';
import { isFeatureEnabled } from '@/lib/settings';
import DonateClient from './donate-client';
import { Loading } from '@/components/loading';
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

export default async function DonatePage() {
	const enabled = await isFeatureEnabled('donations');
	const siteContent = await getSiteContent('donate');

	// Debug logging in development
	if (process.env.NODE_ENV === 'development') {
		console.log('[Donate Page] Site content keys:', Object.keys(siteContent));
		console.log('[Donate Page] Title from DB:', siteContent['donate.title']);
		console.log('[Donate Page] Description from DB:', siteContent['donate.description']);
	}

	return (
		<Suspense
			fallback={
				<div className='container mx-auto px-4 py-8'>
					<Loading size='lg' text='Loading donation form...' />
				</div>
			}
		>
			<DonateClient enabled={enabled} siteContent={siteContent} />
		</Suspense>
	);
}
