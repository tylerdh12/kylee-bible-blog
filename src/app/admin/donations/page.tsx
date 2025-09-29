'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExternalLink, Heart } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Donation } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

export default function DonationsPage() {
	const [donations, setDonations] = useState<Donation[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<any>(null);
	const { formatAmount } = useCurrency();

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		if (user) {
			fetchDonations();
		}
	}, [user]);

	const checkAuth = async () => {
		try {
			const response = await fetch('/api/auth/status');
			const data = await response.json();
			if (data.authenticated) {
				setUser(data.user);
			} else {
				window.location.href = '/admin';
			}
		} catch {
			window.location.href = '/admin';
		}
	};

	const fetchDonations = async () => {
		try {
			const response = await fetch('/api/admin/donations');
			if (response.ok) {
				const data = await response.json();
				setDonations(data.donations || []);
			}
		} catch (error) {
			console.error('Error fetching donations:', error);
		} finally {
			setLoading(false);
		}
	};

	const totalDonations = donations.reduce(
		(sum, donation) => sum + donation.amount,
		0
	);

	if (loading) {
		return (
			<DashboardLayout
				user={user}
				breadcrumbs={[
					{ label: 'Dashboard', href: '/admin' },
					{ label: 'Donations' },
				]}
				title='Donations'
				description='View and manage donations'
			>
				<div className='text-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading donations...
					</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			user={user}
			breadcrumbs={[
				{ label: 'Dashboard', href: '/admin' },
				{ label: 'Donations' },
			]}
			title='Donations'
			description='Track and manage all donations received'
		>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex items-center gap-2'>
					<span className='text-sm text-muted-foreground'>
						{donations.length} total donations
					</span>
				</div>
				<Button
					asChild
					variant='outline'
				>
					<Link
						href='/donate'
						target='_blank'
					>
						<ExternalLink className='h-4 w-4 mr-2' />
						View Donation Page
					</Link>
				</Button>
			</div>

			{/* Summary Card */}
			<Card className='mb-8'>
				<CardHeader>
					<CardTitle>Donation Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div className='text-center'>
							<p className='text-2xl font-bold'>
								{formatAmount(totalDonations)}
							</p>
							<p className='text-muted-foreground'>
								Total Donations
							</p>
						</div>
						<div className='text-center'>
							<p className='text-2xl font-bold'>
								{donations.length}
							</p>
							<p className='text-muted-foreground'>
								Number of Donations
							</p>
						</div>
						<div className='text-center'>
							<p className='text-2xl font-bold'>
								$
								{donations.length > 0
									? (
											totalDonations / donations.length
									  ).toFixed(2)
									: '0.00'}
							</p>
							<p className='text-muted-foreground'>
								Average Donation
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Donations List */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Donations</CardTitle>
				</CardHeader>
				<CardContent>
					{donations.length === 0 ? (
						<div className='text-center py-12 space-y-4'>
							<div className='mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center'>
								<Heart className='h-8 w-8 text-muted-foreground' />
							</div>
							<div>
								<h3 className='text-lg font-semibold'>
									No donations yet
								</h3>
								<p className='text-muted-foreground mb-4'>
									Share your donation page to start
									receiving support.
								</p>
								<Button asChild>
									<Link
										href='/donate'
										target='_blank'
									>
										<ExternalLink className='h-4 w-4 mr-2' />
										View Donation Page
									</Link>
								</Button>
							</div>
						</div>
					) : (
						<div className='space-y-4'>
							{donations.map((donation) => (
								<div
									key={donation.id}
									className='border rounded-lg p-4 hover:shadow-md transition-shadow'
								>
									<div className='flex justify-between items-start'>
										<div className='space-y-2'>
											<div className='flex items-center gap-2'>
												<span className='font-semibold text-green-600'>
													{formatAmount(donation.amount)}
												</span>
												{donation.anonymous ? (
													<Badge variant='secondary'>
														Anonymous
													</Badge>
												) : (
													donation.donorName && (
														<span className='text-muted-foreground'>
															from {donation.donorName}
														</span>
													)
												)}
											</div>

											{donation.goal && (
												<div>
													<Badge variant='outline'>
														Goal: {donation.goal.title}
													</Badge>
												</div>
											)}

											{donation.message && (
												<p className='text-sm text-muted-foreground italic'>
													"{donation.message}"
												</p>
											)}
										</div>

										<div className='text-right text-sm text-muted-foreground'>
											{format(
												new Date(donation.createdAt),
												'PPp'
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</DashboardLayout>
	);
}
