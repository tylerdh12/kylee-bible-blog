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
import { prisma } from '@/lib/db';
import { stripHtmlToText } from '@/lib/utils/sanitize';
import { getSiteSettings } from '@/lib/settings';
import { SubscribeForm } from '@/components/subscribe-form';
import type { Post, Goal } from '@/types';

// Force dynamic rendering to always fetch fresh site content
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
	// Use cached settings or fetch quickly - don't block on this
	let settings;
	try {
		settings = await getSiteSettings();
	} catch (error) {
		// Fallback to defaults if settings fail
		settings = {
			siteName: "Kylee's Blog",
			siteDescription: "Follow Kylee's Bible study journey, support her goals, and join her community.",
			siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
		};
	}
	
	const siteName = settings.siteName || "Kylee's Blog";
	const siteDescription = settings.siteDescription || "Follow Kylee's Bible study journey, support her goals, and join her community.";
	const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';

	return {
		title: `${siteName} - Bible Study Journey & Christian Insights`,
		description: siteDescription,
		keywords: [
			'Bible study',
			'Christian blog',
			'biblical insights',
			'faith journey',
			'Scripture study',
			'spiritual growth',
			'ministry',
			'Christian community',
		],
		openGraph: {
			title: `${siteName} - Bible Study Journey & Christian Insights`,
			description: siteDescription,
			type: 'website',
			locale: 'en_US',
			siteName: siteName,
			...(siteUrl && { url: siteUrl }),
		},
		twitter: {
			card: 'summary_large_image',
			title: `${siteName} - Bible Study Journey & Christian Insights`,
			description: siteDescription,
		},
		alternates: {
			...(siteUrl && { canonical: siteUrl }),
		},
	};
}

async function getSiteContent(page: string) {
	try {
		const content = await prisma.siteContent.findMany({
			where: { page },
			orderBy: [{ section: 'asc' }, { order: 'asc' }],
		});

		const contentMap: Record<string, string> = {};
		content.forEach((item) => {
			contentMap[item.key] = item.content;
		});

		// Debug logging in development
		if (process.env.NODE_ENV === 'development') {
			console.log(`[getSiteContent] Fetched ${content.length} items for page "${page}"`);
			console.log(`[getSiteContent] Content keys:`, Object.keys(contentMap));
		}

		return contentMap;
	} catch (error: any) {
		// Silently handle errors - defaults will be used
		// Only log if it's not a table-not-found error (which is expected on first setup)
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

async function getHomeData() {
	const db = DatabaseService.getInstance();

	try {
		// Fetch data in parallel with individual error handling
		// This ensures one slow query doesn't block the others
		const [posts, goals, siteContent] = await Promise.allSettled([
			db.findPosts({
				published: true,
				includeAuthor: true,
				includeTags: true,
				sort: { field: 'publishedAt', order: 'desc' },
				take: 6,
			}),
			db.findGoals({
				completed: false,
				includeDonations: false, // Don't need donations for homepage display
				sort: { field: 'createdAt', order: 'desc' },
				take: 3,
			}),
			getSiteContent('home'),
		]);

		return {
			posts:
				posts.status === 'fulfilled' ? posts.value : ([] as Post[]),
			goals:
				goals.status === 'fulfilled' ? goals.value : ([] as Goal[]),
			siteContent:
				siteContent.status === 'fulfilled'
					? siteContent.value
					: ({} as Record<string, string>),
		};
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error fetching home data:', error);
		}
		return {
			posts: [] as Post[],
			goals: [] as Goal[],
			siteContent: {} as Record<string, string>,
		};
	}
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount);
}

export default async function Home() {
	const { posts, goals, siteContent } = await getHomeData();

	// Debug logging in development
	if (process.env.NODE_ENV === 'development') {
		console.log('[Home Page] Site content keys:', Object.keys(siteContent));
		console.log('[Home Page] Hero title from DB:', siteContent['home.hero.title']);
		console.log('[Home Page] Hero description from DB:', siteContent['home.hero.description']);
	}

	// Use nullish coalescing to check if key exists, not just if value is truthy
	// This allows empty strings to be used if they're intentionally set
	const heroTitle =
		siteContent['home.hero.title'] !== undefined ? siteContent['home.hero.title'] : "Welcome to Kylee's Blog";
	const heroDescription =
		siteContent['home.hero.description'] !== undefined
			? siteContent['home.hero.description']
			: "Join me on my Bible study journey as I explore God's word, share insights, and grow in faith. Together, we can support ministry goals and build community.";
	const recentPostsTitle =
		siteContent['home.recent-posts.title'] !== undefined ? siteContent['home.recent-posts.title'] : 'Recent Posts';
	const goalsTitle = siteContent['home.goals.title'] !== undefined ? siteContent['home.goals.title'] : 'Current Goals';

	return (
		<div className='container px-4 py-8 mx-auto'>
			{/* Hero Section */}
			<div className='mb-12 text-center'>
				<h1 className='mb-4 text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r md:text-4xl from-primary to-primary/60 pb-1'>
					{heroTitle}
				</h1>
				<p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
					{heroDescription}
				</p>
			</div>

			{/* Recent Posts Section */}
			<div className='space-y-12'>
				<div>
					<div className='flex justify-between items-center mb-6'>
						<h2 className='text-3xl font-semibold'>
							{recentPostsTitle}
						</h2>
						<Link
							href='/posts'
							className='text-primary hover:underline'
							prefetch={true}
						>
							View all posts →
						</Link>
					</div>

					{posts.length === 0 ? (
						<Card>
							<CardContent className='py-8 text-center'>
								<p className='mb-4 text-muted-foreground'>
									Welcome to Kylee's Bible Blog!
								</p>
								<p className='text-sm text-muted-foreground'>
									Posts are loading or will be available
									soon. In the meantime, explore other
									sections of the site or check out the
									admin setup.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
							{posts.map((post) => (
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
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className='mb-4 text-muted-foreground line-clamp-3'>
											{post.excerpt
												? stripHtmlToText(post.excerpt, 150)
												: stripHtmlToText(post.content, 150)}
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
				</div>

				{/* Goals Section */}
				<div>
					<div className='flex justify-between items-center mb-6'>
						<h2 className='text-3xl font-semibold'>
							{goalsTitle}
						</h2>
					</div>

					{goals.length === 0 ? (
						<Card>
							<CardContent className='py-8 text-center'>
								<p className='mb-4 text-muted-foreground'>
									Goals will be available soon!
								</p>
								<p className='text-sm text-muted-foreground'>
									Ministry goals and donation tracking are
									being set up. Visit the admin panel to
									configure goals once the system is ready.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
							{goals.map((goal) => {
								const progress =
									(goal.currentAmount / goal.targetAmount) *
									100;
								return (
									<Card key={goal.id}>
										<CardHeader>
											<CardTitle className='line-clamp-1'>
												{goal.title}
											</CardTitle>
											<CardDescription className='line-clamp-2'>
												{goal.description}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className='mb-4'>
												<div className='flex justify-between mb-2 text-sm'>
													<span>
														{formatCurrency(
															goal.currentAmount
														)}
													</span>
													<span>
														{formatCurrency(
															goal.targetAmount
														)}
													</span>
												</div>
												<div className='w-full h-2 rounded-full bg-secondary'>
													<div
														className='h-2 rounded-full transition-all bg-primary'
														style={{
															width: `${Math.min(
																progress,
																100
															)}%`,
														}}
													/>
												</div>
												<p className='mt-2 text-sm text-center text-muted-foreground'>
													{progress.toFixed(1)}% completed
												</p>
											</div>
											<p className='text-sm text-muted-foreground'>
												Donation functionality coming soon!
											</p>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</div>

				{/* Subscription Section */}
				<div className='mt-16'>
					<SubscribeForm variant='card' />
				</div>
			</div>
		</div>
	);
}
