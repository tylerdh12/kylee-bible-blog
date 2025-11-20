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
import { Donation } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

export default function DonationsPage() {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const { formatAmount } = useCurrency();

	useEffect(() => {
		fetchDonations();
	}, []);

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
			<div className='py-8 text-center'>
				<div className='mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-primary'></div>
				<p className='text-muted-foreground'>
					Loading donations...
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex gap-2 items-center'>
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
						<ExternalLink className='mr-2 w-4 h-4' />
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
					<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
						<div className='py-12 space-y-4 text-center'>
							<div className='flex justify-center items-center mx-auto w-16 h-16 rounded-full bg-muted'>
								<Heart className='w-8 h-8 text-muted-foreground' />
							</div>
							<div>
								<h3 className='text-lg font-semibold'>
									No donations yet
								</h3>
								<p className='mb-4 text-muted-foreground'>
									Share your donation page to start
									receiving support.
								</p>
								<Button asChild>
									<Link
										href='/donate'
										target='_blank'
									>
										<ExternalLink className='mr-2 w-4 h-4' />
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
									className='p-4 rounded-lg border transition-shadow hover:shadow-md'
								>
									<div className='flex justify-between items-start'>
										<div className='space-y-2'>
											<div className='flex gap-2 items-center'>
												<span className='font-semibold text-green-600 dark:text-green-400'>
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
												<p className='text-sm italic text-muted-foreground'>
													"{donation.message}"
												</p>
											)}
										</div>

										<div className='text-sm text-right text-muted-foreground'>
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
		</div>
	);
}
