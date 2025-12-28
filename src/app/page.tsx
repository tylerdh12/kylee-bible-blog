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
import type { Post, Goal } from '@/types';

// Use dynamic rendering to fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
	title:
		"Kylee's Bible Blog - Bible Study Journey & Christian Insights",
	description:
		"Join Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word. Support ministry goals and grow in faith together.",
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
		title:
			"Kylee's Bible Blog - Bible Study Journey & Christian Insights",
		description:
			"Join Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word.",
		type: 'website',
		locale: 'en_US',
		siteName: "Kylee's Bible Blog",
	},
	twitter: {
		card: 'summary_large_image',
		title:
			"Kylee's Bible Blog - Bible Study Journey & Christian Insights",
		description:
			"Join Kylee's Bible study journey. Discover biblical insights and spiritual reflections.",
	},
	alternates: {
		canonical: '/',
	},
};

async function getHomeData() {
	const db = DatabaseService.getInstance();

	try {
		const [posts, goals] = await Promise.all([
			db
				.findPosts({
					published: true,
					includeAuthor: true,
					includeTags: true,
					sort: { field: 'publishedAt', order: 'desc' },
					take: 6,
				})
				.catch(() => [] as Post[]),
			db
				.findGoals({
					completed: false,
					sort: { field: 'createdAt', order: 'desc' },
					take: 3,
				})
				.catch(() => [] as Goal[]),
		]);

		return { posts, goals };
	} catch (error) {
		console.error('Error fetching home data:', error);
		return { posts: [] as Post[], goals: [] as Goal[] };
	}
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount);
}

export default async function Home() {
	const { posts, goals } = await getHomeData();

	return (
		<div className='container px-4 py-8 mx-auto'>
			{/* Hero Section */}
			<div className='mb-12 text-center'>
				<h1 className='mb-4 text-4xl font-bold'>
					Welcome to Kylee's Blog
				</h1>
				<p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
					Join me on my Bible study journey as I explore
					God&apos;s word, share insights, and grow in
					faith. Together, we can support ministry goals and
					build community.
				</p>
			</div>

			{/* Recent Posts Section */}
			<div className='space-y-12'>
				<div>
					<div className='flex justify-between items-center mb-6'>
						<h2 className='text-3xl font-semibold'>
							Recent Posts
						</h2>
						<Link
							href='/posts'
							className='text-primary hover:underline'
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
											{post.excerpt ||
												post.content.substring(0, 150) +
													'...'}
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
							Current Goals
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
			</div>
		</div>
	);
}
