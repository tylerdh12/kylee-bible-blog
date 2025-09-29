'use client';

import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Goal } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

export function GoalsContent() {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { formatAmount } = useCurrency();

	useEffect(() => {
		async function loadGoals() {
			try {
				setLoading(true);
				setError(null);

				// Load goals from API endpoint with timeout
				const controller = new AbortController();
				const timeoutId = setTimeout(
					() => controller.abort(),
					8000
				); // 8 second timeout

				try {
					const response = await fetch(
						'/api/public/goals',
						{
							signal: controller.signal,
							cache: 'no-store',
						}
					);

					clearTimeout(timeoutId);

					if (response.ok) {
						const data = await response.json();
						setGoals(data.goals || []);
					} else {
						console.log(
							'Goals API not available, using fallback'
						);
						setGoals([]);
					}
				} catch (err) {
					if (
						err instanceof Error &&
						err.name === 'AbortError'
					) {
						console.log(
							'Request timed out, using fallback content'
						);
					} else {
						console.log(
							'API request failed, using fallback content'
						);
					}
					setGoals([]);
				}
			} catch (err) {
				console.error('Failed to load goals:', err);
				setError('Unable to load goals');
				setGoals([]);
			} finally {
				setLoading(false);
			}
		}

		loadGoals();
	}, []);

	if (loading) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{[1, 2, 3].map((i) => (
					<Card
						key={i}
						className='animate-pulse flex flex-col'
					>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div className='h-6 bg-muted rounded w-3/4'></div>
								<div className='h-6 bg-muted rounded w-16'></div>
							</div>
							<div className='h-4 bg-muted rounded w-5/6'></div>
						</CardHeader>
						<CardContent className='flex-1 flex flex-col'>
							<div className='mb-6'>
								<div className='flex justify-between mb-2'>
									<div className='h-4 bg-muted rounded w-16'></div>
									<div className='h-4 bg-muted rounded w-16'></div>
								</div>
								<div className='h-3 bg-muted rounded w-full'></div>
								<div className='flex justify-between mt-2'>
									<div className='h-3 bg-muted rounded w-20'></div>
									<div className='h-3 bg-muted rounded w-16'></div>
								</div>
							</div>
							<div className='mt-auto'>
								<div className='h-10 bg-muted rounded w-full'></div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (goals.length === 0) {
		return (
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
		);
	}

	return (
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
										{formatAmount(goal.currentAmount)}
									</span>
									<span className='text-muted-foreground'>
										{formatAmount(goal.targetAmount)}
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
	);
}
