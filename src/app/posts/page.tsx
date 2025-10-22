import { Metadata } from 'next';
import { PostsContent } from '@/components/posts-content';

// Force static rendering for better performance
export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes

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

export default function PostsPage() {
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

				{/* Dynamic Content */}
				<PostsContent />
			</div>
		</div>
	);
}
