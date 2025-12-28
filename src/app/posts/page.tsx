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
import type { Post } from '@/types';

// Use dynamic rendering to fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
	title: "All Blog Posts - Kylee's Bible Study Journey",
	description:
		"Explore all blog posts from Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word for daily life.",
	keywords: [
		'Bible study',
		'Christian blog',
		'spiritual growth',
		'biblical insights',
		'faith journey',
		'Scripture study',
	],
	openGraph: {
		title: "All Blog Posts - Kylee's Bible Study Journey",
		description:
			"Explore all blog posts from Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word.",
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		title: "All Blog Posts - Kylee's Bible Study Journey",
		description:
			"Explore all blog posts from Kylee's Bible study journey. Discover in-depth biblical insights and spiritual reflections.",
	},
};

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
		console.error('Error fetching posts:', error);
		return [] as Post[];
	}
}

export default async function PostsPage() {
	const posts = await getPosts();

	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
			<div className='container px-4 py-8 mx-auto'>
				{/* Header */}
				<div className='mb-12 text-center'>
					<h1 className='mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r md:text-5xl from-primary to-primary/60'>
						All Blog Posts
					</h1>
					<p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
						Explore all posts from Kylee's Bible study
						journey and spiritual insights
					</p>
				</div>

				{/* Posts Grid */}
				{posts.length === 0 ? (
					<Card>
						<CardContent className='py-12 text-center'>
							<h3 className='mb-4 text-xl font-semibold'>
								No Posts Yet
							</h3>
							<p className='mb-4 text-muted-foreground'>
								Welcome to Kylee's Bible Blog! Posts are
								being prepared and will be available soon.
							</p>
							<p className='text-sm text-muted-foreground'>
								Check back soon for inspiring Bible studies
								and spiritual insights, or visit the admin
								panel to create your first post.
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
										{post.author &&
											` • By ${post.author.name}`}
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
		</div>
	);
}
