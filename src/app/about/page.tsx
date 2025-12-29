import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
	title:
		'About Kylee - Bible Study Teacher & Christian Writer',
	description:
		"Learn about Kylee's faith journey and mission to make Bible study accessible to everyone. Discover her passion for biblical truth, spiritual growth, and building Christian community.",
	keywords: [
		'about Kylee',
		'Bible study teacher',
		'Christian writer',
		'faith journey',
		'biblical education',
		'Christian ministry',
	],
	openGraph: {
		title:
			'About Kylee - Bible Study Teacher & Christian Writer',
		description:
			"Learn about Kylee's faith journey and mission to make Bible study accessible to everyone. Discover her passion for biblical truth and spiritual growth.",
		type: 'profile',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		title:
			'About Kylee - Bible Study Teacher & Christian Writer',
		description:
			"Learn about Kylee's faith journey and mission to make Bible study accessible to everyone.",
	},
};

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

		return contentMap;
	} catch (error) {
		console.error('Error fetching site content:', error);
		return {};
	}
}

export default async function AboutPage() {
	const siteContent = await getSiteContent('about');

	const pageTitle = siteContent['about.title'] || 'About Kylee';
	const pageSubtitle =
		siteContent['about.subtitle'] ||
		'Welcome to my corner of the internet where faith meets daily life';
	const journeyTitle = siteContent['about.journey.title'] || 'My Journey';
	const journeyContent =
		siteContent['about.journey.content'] ||
		`Hi! I'm Kylee, a passionate Bible student on a journey to understand God's word more deeply and share what I learn with others. This blog is my way of documenting insights, struggles, and victories as I grow in faith.

Whether you're a new believer or have been walking with Christ for years, I hope you'll find encouragement and biblical truth here that speaks to your heart and draws you closer to our Savior.

I believe that studying God's word should be accessible to everyone, regardless of their background or level of biblical knowledge. That's why I write in a way that's easy to understand while staying true to Scripture.`;
	const findHereTitle =
		siteContent['about.find-here.title'] || "What You'll Find Here";
	const findHereContent =
		siteContent['about.find-here.content'] ||
		`In-depth Bible studies and verse-by-verse explorations
Personal reflections on how Scripture applies to daily life
Prayer requests and testimonies of God's faithfulness
Resources for deeper Bible study and spiritual growth
Updates on ministry goals and how you can be involved`;
	const missionTitle = siteContent['about.mission.title'] || 'My Mission';
	const missionContent =
		siteContent['about.mission.content'] ||
		`My heart's desire is to help others fall in love with God's word the way I have. I want to make Bible study approachable, relevant, and transformative for people from all walks of life.

Through this platform, I hope to build a community where we can grow together, encourage one another, and support each other in our faith journeys. I believe that when we study God's word together, we gain insights we might miss on our own.

"Your word is a lamp for my feet, a light on my path." - Psalm 119:105`;
	const involvedTitle =
		siteContent['about.involved.title'] || 'Get Involved';
	const involvedConversation =
		siteContent['about.involved.conversation'] ||
		"I'd love to hear your thoughts on the posts and studies shared here. Your insights and questions help make this community stronger.";
	const involvedSupport =
		siteContent['about.involved.support'] ||
		'If God has used this ministry to bless you, consider supporting our goals to reach more people with His word.';

	// Parse list items from findHereContent
	const listItems = findHereContent
		.split('\n')
		.filter((item) => item.trim().length > 0);

	return (
		<div className='container px-4 py-8 mx-auto max-w-4xl'>
			<div className='mb-12 text-center'>
				<h1 className='mb-4 text-4xl font-bold'>{pageTitle}</h1>
				<p className='text-xl text-muted-foreground'>{pageSubtitle}</p>
			</div>

			<div className='grid grid-cols-1 gap-8 mb-12 lg:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>{journeyTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						{journeyContent.split('\n\n').map((paragraph, index) => (
							<p
								key={index}
								className={
									index < journeyContent.split('\n\n').length - 1
										? 'mb-4 text-muted-foreground'
										: 'text-muted-foreground'
								}
							>
								{paragraph}
							</p>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{findHereTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className='space-y-3 text-muted-foreground'>
							{listItems.map((item, index) => (
								<li
									key={index}
									className='flex gap-2 items-start'
								>
									<span className='font-bold text-primary'>•</span>
									<span>{item.trim()}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>

			<Card className='mb-8'>
				<CardHeader>
					<CardTitle>{missionTitle}</CardTitle>
				</CardHeader>
				<CardContent>
					{missionContent.split('\n\n').map((paragraph, index) => {
						if (paragraph.includes('"')) {
							return (
								<blockquote
									key={index}
									className='pl-4 italic border-l-4 border-primary text-muted-foreground'
								>
									{paragraph}
								</blockquote>
							);
						}
						return (
							<p
								key={index}
								className={
									index < missionContent.split('\n\n').length - 1
										? 'mb-4 text-muted-foreground'
										: 'text-muted-foreground'
								}
							>
								{paragraph}
							</p>
						);
					})}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{involvedTitle}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div>
							<h4 className='mb-2 font-semibold'>
								Join the Conversation
							</h4>
							<p className='mb-4 text-sm text-muted-foreground'>
								{involvedConversation}
							</p>
						</div>
						<div>
							<h4 className='mb-2 font-semibold'>
								Support the Ministry
							</h4>
							<p className='mb-4 text-sm text-muted-foreground'>
								{involvedSupport}
							</p>
						</div>
					</div>
					<div className='mt-6'>
						<p className='text-sm text-muted-foreground'>
							Ministry goals and donation features are
							coming soon! Stay tuned for updates.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
