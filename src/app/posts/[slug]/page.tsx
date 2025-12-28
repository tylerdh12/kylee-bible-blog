import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DatabaseService } from '@/lib/services/database';
import Link from 'next/link';

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

async function getPost(slug: string) {
	const db = DatabaseService.getInstance();
	const post = await db.findPostBySlug(slug, true);
	return post;
}

interface PageProps {
	params: Promise<{ slug: string }>;
}

export default async function PostPage({
	params,
}: PageProps) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/10'>
			<div className='container px-4 py-8 mx-auto max-w-4xl'>
				<article>
					{/* Breadcrumb Navigation */}
					<nav className='flex gap-2 items-center mb-8 text-sm text-muted-foreground'>
						<Link
							href='/'
							className='transition-colors hover:text-foreground'
						>
							Home
						</Link>
						<span>→</span>
						<Link
							href='/posts'
							className='transition-colors hover:text-foreground'
						>
							Posts
						</Link>
						<span>→</span>
						<span className='text-foreground'>
							{post.title}
						</span>
					</nav>

					{/* Article Header */}
					<header className='mb-12'>
						<h1 className='mb-6 text-4xl font-bold leading-tight md:text-5xl'>
							{post.title}
						</h1>

						{/* Author & Date Info */}
						<div className='flex flex-wrap gap-4 items-center pb-6 mb-6 border-b text-muted-foreground'>
							{post.author?.name && (
								<div className='flex gap-2 items-center'>
									<div className='flex justify-center items-center w-8 h-8 rounded-full bg-primary/10'>
										<span className='text-sm font-medium'>
											{post.author.name
												.charAt(0)
												.toUpperCase()}
										</span>
									</div>
									<span>By {post.author.name}</span>
								</div>
							)}
							{post.publishedAt && (
								<div className='flex gap-2 items-center'>
									<span>📅</span>
									<span>
										Published{' '}
										{format(
											new Date(post.publishedAt),
											'MMMM dd, yyyy'
										)}
									</span>
								</div>
							)}
						</div>

						{/* Tags */}
						{post.tags && post.tags.length > 0 && (
							<div className='flex flex-wrap gap-2 mb-8'>
								{post.tags.map((tag: any) => (
									<Badge
										key={tag.id}
										variant='secondary'
										className='transition-colors bg-primary/10 hover:bg-primary/20'
									>
										{tag.name}
									</Badge>
								))}
							</div>
						)}
					</header>

					{/* Article Content */}
					<div className='mb-16'>
						<div
							className='max-w-none prose prose-lg prose-slate dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg'
							dangerouslySetInnerHTML={{
								__html: post.content,
							}}
						/>
					</div>
				</article>

				{/* Call-to-Action Section */}
				<div className='pt-8 mt-16 border-t border-border/50'>
					<div className='p-8 text-center bg-gradient-to-r rounded-xl from-primary/5 to-primary/10'>
						<h3 className='mb-3 text-2xl font-semibold'>
							💝 Was this post helpful?
						</h3>
						<p className='mx-auto mb-6 max-w-2xl text-muted-foreground'>
							If this post blessed you or helped in your
							spiritual journey, feel free to share your
							prayer requests or connect with our community.
						</p>
						<div className='flex flex-col gap-4 justify-center sm:flex-row'>
							<Link
								href='/prayer-requests'
								className='inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-lg shadow-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-105'
							>
								<span className='mr-2'>🙏</span>
								Share Prayer Request
							</Link>
							<Link
								href='/about'
								className='inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-lg border shadow-sm transition-all border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105'
							>
								<span className='mr-2'>💖</span>
								Learn About Kylee
							</Link>
						</div>
					</div>
				</div>

				{/* Back to Posts */}
				<div className='mt-8 text-center'>
					<Link
						href='/posts'
						className='inline-flex gap-2 items-center transition-colors text-muted-foreground hover:text-foreground'
					>
						<svg
							className='w-4 h-4'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M15 19l-7-7 7-7'
							/>
						</svg>
						Back to All Posts
					</Link>
				</div>
			</div>
		</div>
	);
}
