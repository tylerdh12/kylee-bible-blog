import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import {
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DatabaseService } from '@/lib/services/database';
import type { Goal } from '@/types';
import { prisma } from '@/lib/db';

// Use dynamic rendering to fetch fresh data
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

export const metadata: Metadata = {
	title:
		"Ministry Goals - Support Kylee's Bible Study Mission",
	description:
		"Support Kylee's ministry goals and help further God's work. View current fundraising goals for Bible study resources, ministry outreach, and spreading God's love in the community.",
	keywords: [
		'ministry goals',
		'Christian fundraising',
		'Bible study support',
		'ministry donations',
		'Christian giving',
		'spiritual support',
	],
	openGraph: {
		title:
			"Ministry Goals - Support Kylee's Bible Study Mission",
		description:
			"Support Kylee's ministry goals and help further God's work. View current fundraising goals for Bible study resources and ministry outreach.",
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		title:
			"Ministry Goals - Support Kylee's Bible Study Mission",
		description:
			"Support Kylee's ministry goals and help further God's work through Bible study resources and ministry outreach.",
	},
};

async function getGoals() {
	const db = DatabaseService.getInstance();

	try {
		const goals = await db.findGoals({
			sort: { field: 'createdAt', order: 'desc' },
			includeDonations: true,
		});

		return goals;
	} catch (error) {
		console.error('Error fetching goals:', error);
		return [] as Goal[];
	}
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount);
}

export default async function GoalsPage() {
	const goals = await getGoals();
	const siteContent = await getSiteContent('goals');

	// Debug logging in development
	if (process.env.NODE_ENV === 'development') {
		console.log('[Goals Page] Site content keys:', Object.keys(siteContent));
		console.log('[Goals Page] Title from DB:', siteContent['goals.title']);
		console.log('[Goals Page] Description from DB:', siteContent['goals.description']);
	}

	// Use nullish coalescing to check if key exists, not just if value is truthy
	const pageTitle = siteContent['goals.title'] !== undefined ? siteContent['goals.title'] : 'Ministry Goals';
	const pageDescription = siteContent['goals.description'] !== undefined ? siteContent['goals.description'] : "Support Kylee's Bible study journey and ministry goals. Every contribution helps further God's work and spreads His love.";
	const emptyTitle = siteContent['goals.empty.title'] !== undefined ? siteContent['goals.empty.title'] : 'Ministry Goals Coming Soon';
	const emptyDescription = siteContent['goals.empty.description'] !== undefined ? siteContent['goals.empty.description'] : "Kylee is setting up ministry goals to support her Bible study journey and outreach.";
	const emptyFooter = siteContent['goals.empty.footer'] !== undefined ? siteContent['goals.empty.footer'] : 'Check back soon for opportunities to support Bible study resources, ministry events, and community outreach programs.';
	const supportTitle = siteContent['goals.support.title'] !== undefined ? siteContent['goals.support.title'] : 'Want to Support in Other Ways?';
	const supportDescription = siteContent['goals.support.description'] !== undefined ? siteContent['goals.support.description'] : "You can also support Kylee's ministry through prayer, sharing her posts, or connecting her with others who might benefit from her Bible studies.";

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

				{/* Goals Grid */}
				{goals.length === 0 ? (
					<Card>
						<CardContent className='py-12 text-center'>
							<h3 className='text-xl font-semibold mb-4'>
								Ministry Goals Coming Soon
							</h3>
							<p className='text-muted-foreground mb-4'>
								Kylee is setting up ministry goals to support
								her Bible study journey and outreach.
							</p>
							<p className='text-sm text-muted-foreground'>
								Check back soon for opportunities to support
								Bible study resources, ministry events, and
								community outreach programs.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{goals.map((goal) => {
							const progress =
								(goal.currentAmount / goal.targetAmount) * 100;

							return (
								<Card
									key={goal.id}
									className='flex flex-col hover:shadow-lg transition-shadow'
								>
									<CardHeader>
										<div className='flex justify-between items-start'>
											<CardTitle className='line-clamp-2'>
												{goal.title}
											</CardTitle>
											{goal.completed && (
												<Badge
													variant='default'
													className='ml-2'
												>
													Completed
												</Badge>
											)}
										</div>
										{goal.description && (
											<CardDescription className='line-clamp-3'>
												{goal.description}
											</CardDescription>
										)}
									</CardHeader>

									<CardContent className='flex-1 flex flex-col'>
										<div className='mb-6'>
											<div className='flex justify-between text-sm mb-2'>
												<span className='font-medium'>
													{formatCurrency(goal.currentAmount)}
												</span>
												<span className='text-muted-foreground'>
													{formatCurrency(goal.targetAmount)}
												</span>
											</div>
											<div className='w-full bg-secondary rounded-full h-3'>
												<div
													className={`h-3 rounded-full transition-all ${
														goal.completed
															? 'bg-green-500'
															: 'bg-primary'
													}`}
													style={{
														width: `${Math.min(progress, 100)}%`,
													}}
												/>
											</div>
											<div className='flex justify-between text-sm mt-2'>
												<span className='text-muted-foreground'>
													{progress.toFixed(1)}% completed
												</span>
												{goal.donations && (
													<span className='text-muted-foreground'>
														{goal.donations.length} donor
														{goal.donations.length !== 1
															? 's'
															: ''}
													</span>
												)}
											</div>
										</div>

										{goal.deadline && (
											<div className='mb-4'>
												<p className='text-sm text-muted-foreground'>
													Deadline:{' '}
													{format(new Date(goal.deadline), 'PPP')}
												</p>
											</div>
										)}

										<div className='mt-auto'>
											{!goal.completed ? (
												<Link href={`/donate?goal=${goal.id}`}>
													<Button className='w-full'>
														Support This Goal
													</Button>
												</Link>
											) : (
												<Button
													disabled
													className='w-full'
												>
													Goal Completed! 🎉
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Support Options */}
				<div className='mt-12 text-center'>
					<Card>
						<CardContent className='py-8'>
							<h3 className='mb-4 text-xl font-semibold'>
								{supportTitle}
							</h3>
							<p className='mb-4 text-muted-foreground'>
								{supportDescription}
							</p>
							<Link href='/donate'>
								<Button variant='outline'>
									Make a General Donation
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
