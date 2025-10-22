import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { GoalsContent } from '@/components/goals-content';

// Force static rendering for better performance
export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes

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

export default function GoalsPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
						Ministry Goals
					</h1>
					<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
						Support Kylee's Bible study journey and ministry
						goals. Every contribution helps further God's
						work and spreads His love.
					</p>
				</div>

				{/* Dynamic Content */}
				<GoalsContent />

				{/* Support Options */}
				<div className='text-center mt-12'>
					<Card>
						<CardContent className='py-8'>
							<h3 className='text-xl font-semibold mb-4'>
								Want to Support in Other Ways?
							</h3>
							<p className='text-muted-foreground mb-4'>
								You can also support Kylee's ministry
								through prayer, sharing her posts, or
								connecting her with others who might benefit
								from her Bible studies.
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
