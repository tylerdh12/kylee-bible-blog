'use client';

import {
	Card,
	CardContent,
} from '@/components/ui/card';
import {
	FileText,
	Eye,
	MessageCircle,
	Users,
	HeartHandshake,
	Target,
	Heart,
} from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from './types';

interface DashboardStatsClientProps {
	stats: DashboardStatsType;
}

export default function DashboardStatsClient({ stats }: DashboardStatsClientProps) {
	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<FileText className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Total Posts
							</p>
							<p className='text-2xl font-bold'>
								{stats.totalPosts || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<Eye className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Published
							</p>
							<p className='text-2xl font-bold'>
								{stats.publishedPosts || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<MessageCircle className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Comments
							</p>
							<p className='text-2xl font-bold'>
								{stats.totalComments || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<Users className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Subscribers
							</p>
							<p className='text-2xl font-bold'>
								{stats.totalSubscribers || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<HeartHandshake className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Prayer Requests
							</p>
							<p className='text-2xl font-bold'>
								{stats.totalPrayerRequests || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<Target className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Active Goals
							</p>
							<p className='text-2xl font-bold'>
								{stats.activeGoals || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<Heart className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Total Donations
							</p>
							<p className='text-2xl font-bold'>
								${(stats.totalDonationAmount || 0).toFixed(2)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center'>
						<Heart className='w-4 h-4 text-muted-foreground' />
						<div className='ml-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Donation Count
							</p>
							<p className='text-2xl font-bold'>
								{stats.totalDonations || 0}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
