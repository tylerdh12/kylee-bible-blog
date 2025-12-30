import { Metadata } from 'next';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { DatabaseService } from '@/lib/services/database';
import { stripHtmlToText } from '@/lib/utils/sanitize';
import { SubscribeForm } from '@/components/subscribe-form';
import type { Post } from '@/types';
import { prisma } from '@/lib/db';

// Force dynamic rendering to always fetch fresh site content
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
		if (
			process.env.NODE_ENV === 'development' &&
			error?.code !== 'P2021' &&
			!error?.message?.includes('does not exist')
		) {
			console.error('Error fetching site content:', error);
		}
		return {};
	}
}

export async function generateMetadata(): Promise<Metadata> {
	const { getSiteSettings } = await import('@/lib/settings');
	const settings = await getSiteSettings();
	const siteName = settings.siteName || "Kylee's Blog";
	const siteDescription = settings.siteDescription || "Follow Kylee's Bible study journey, support her goals, and join her community.";
	const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';

	return {
		title: `All Blog Posts - ${siteName}`,
		description: `Explore all blog posts from ${siteName}. ${siteDescription}`,
		keywords: [
			'Bible study',
			'Christian blog',
			'spiritual growth',
			'biblical insights',
			'faith journey',
			'Scripture study',
		],
		openGraph: {
			title: `All Blog Posts - ${siteName}`,
			description: `Explore all blog posts from ${siteName}. ${siteDescription}`,
			type: 'website',
			locale: 'en_US',
			siteName: siteName,
			...(siteUrl && { url: `${siteUrl}/posts` }),
		},
		twitter: {
			card: 'summary_large_image',
			title: `All Blog Posts - ${siteName}`,
			description: `Explore all blog posts from ${siteName}. ${siteDescription}`,
		},
		alternates: {
			...(siteUrl && { canonical: `${siteUrl}/posts` }),
		},
	};
}

async function getPosts() {
	const db = DatabaseService.getInstance();

	try {
		const posts = await db.findPosts({
			published: true,
			includeAuthor: true,
			includeTags: true,
			sort: { field: 'publishedAt', order: 'desc' },
		});

		return posts;
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error fetching posts:', error);
		}
		return [] as Post[];
	}
}

export default async function PostsPage() {
	const posts = await getPosts();
	const siteContent = await getSiteContent('posts');
	
	// Process posts to sanitize excerpts/content (async on server)
	const processedPosts = await Promise.all(
		posts.map(async (post) => ({
			...post,
			sanitizedExcerpt: post.excerpt 
				? await stripHtmlToText(post.excerpt, 150)
				: await stripHtmlToText(post.content, 150),
		}))
	);

	// Debug logging in development
	if (process.env.NODE_ENV === 'development') {
		console.log('[Posts Page] Site content keys:', Object.keys(siteContent));
		console.log('[Posts Page] Title from DB:', siteContent['posts.title']);
		console.log('[Posts Page] Description from DB:', siteContent['posts.description']);
	}

	// Use nullish coalescing to check if key exists, not just if value is truthy
	const pageTitle = siteContent['posts.title'] !== undefined ? siteContent['posts.title'] : 'All Blog Posts';
	const pageDescription = siteContent['posts.description'] !== undefined ? siteContent['posts.description'] : "Explore all posts from Kylee's Bible study journey and spiritual insights";
	const emptyTitle = siteContent['posts.empty.title'] !== undefined ? siteContent['posts.empty.title'] : 'No Posts Yet';
	const emptyDescription = siteContent['posts.empty.description'] !== undefined ? siteContent['posts.empty.description'] : "Welcome to Kylee's Bible Blog! Posts are being prepared and will be available soon.";
	const emptyFooter = siteContent['posts.empty.footer'] !== undefined ? siteContent['posts.empty.footer'] : 'Check back soon for inspiring Bible studies and spiritual insights, or visit the admin panel to create your first post.';

	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
			<div className='container px-4 py-8 mx-auto'>
				{/* Header */}
				<div className='mb-12 text-center'>
					<h1 className='mb-4 text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r md:text-4xl from-primary to-primary/60 pb-1'>
						{pageTitle}
					</h1>
					<p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
						{pageDescription}
					</p>
				</div>

				{/* Posts Grid */}
				{posts.length === 0 ? (
					<Card>
						<CardContent className='py-12 text-center'>
							<h3 className='mb-4 text-xl font-semibold'>
								{emptyTitle}
							</h3>
							<p className='mb-4 text-muted-foreground'>
								{emptyDescription}
							</p>
							<p className='text-sm text-muted-foreground'>
								{emptyFooter}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{processedPosts.map((post) => (
							<Card
								key={post.id}
								className='transition-shadow hover:shadow-lg'
							>
								<CardHeader>
									<CardTitle className='line-clamp-2'>
										{post.title}
									</CardTitle>
									<CardDescription>
										{post.publishedAt &&
											format(
												new Date(post.publishedAt),
												'PPP'
											)}
										{post.author &&
											` • By ${post.author.name}`}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className='mb-4 text-muted-foreground line-clamp-3'>
										{post.sanitizedExcerpt}
									</p>
									{post.tags && post.tags.length > 0 && (
										<div className='flex flex-wrap gap-2 mb-4'>
											{post.tags.map((tag) => (
												<Badge
													key={tag.id}
													variant='secondary'
												>
													{tag.name}
												</Badge>
											))}
										</div>
									)}
									<Link
										href={`/posts/${post.slug}`}
										className='font-medium text-primary hover:underline'
										prefetch={true}
									>
										Read more →
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Subscription Section */}
				<div className='mt-16'>
					<SubscribeForm variant='card' />
				</div>
			</div>
		</div>
	);
}
