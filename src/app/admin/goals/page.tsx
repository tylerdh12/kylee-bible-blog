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
import { Plus, Edit } from 'lucide-react';
import { Goal } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

export default function GoalsPage() {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [loading, setLoading] = useState(true);
	const { formatAmount } = useCurrency();

	useEffect(() => {
		fetchGoals();
	}, []);

	const fetchGoals = async () => {
		try {
			const response = await fetch('/api/admin/goals');
			if (response.ok) {
				const data = await response.json();
				setGoals(data.goals || []);
			}
		} catch (error) {
			console.error('Error fetching goals:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading goals...</p>
			</div>
		);
	}

	return (
		<>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex items-center gap-2'>
					<span className='text-sm text-muted-foreground'>
						{goals.length} total goals
					</span>
				</div>
				<Button asChild>
					<Link href='/admin/goals/new'>
						<Plus className='h-4 w-4 mr-2' />
						New Goal
					</Link>
				</Button>
			</div>

			{goals.length === 0 ? (
				<Card>
					<CardContent className='py-12'>
						<div className='text-center space-y-4'>
							<div className='mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center'>
								🎯
							</div>
							<div>
								<h3 className='text-lg font-semibold'>
									No goals yet
								</h3>
								<p className='text-muted-foreground'>
									Create your first fundraising goal to get
									started.
								</p>
							</div>
							<Button asChild>
								<Link href='/admin/goals/new'>
									<Plus className='h-4 w-4 mr-2' />
									Create Your First Goal
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-6'>
					{goals.map((goal) => {
						const progressPercentage =
							goal.targetAmount > 0
								? (goal.currentAmount / goal.targetAmount) *
								  100
								: 0;

						return (
							<Card key={goal.id}>
								<CardHeader>
									<div className='flex justify-between items-start'>
										<div>
											<CardTitle className='flex items-center gap-2'>
												{goal.title}
												{goal.completed && (
													<Badge
														variant='outline'
														className='text-green-600 border-green-600 dark:text-green-400 dark:border-green-400'
													>
														Completed
													</Badge>
												)}
											</CardTitle>
											{goal.description && (
												<p className='text-muted-foreground mt-2'>
													{goal.description}
												</p>
											)}
										</div>
										<div className='text-right'>
											<p className='text-2xl font-bold'>
												{formatAmount(goal.currentAmount)} /{' '}
												{formatAmount(goal.targetAmount)}
											</p>
											<p className='text-sm text-muted-foreground'>
												{progressPercentage.toFixed(1)}%
												complete
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{/* Progress Bar */}
										<div className='w-full bg-gray-200 rounded-full h-2'>
											<div
												className={`h-2 rounded-full ${
													goal.completed
														? 'bg-green-600'
														: 'bg-blue-600'
												}`}
												style={{
													width: `${Math.min(
														progressPercentage,
														100
													)}%`,
												}}
											></div>
										</div>

										<div className='flex justify-between items-center text-sm text-muted-foreground'>
											<div>
												<span>
													Created:{' '}
													{format(
														new Date(goal.createdAt),
														'MMM dd, yyyy'
													)}
												</span>
												{goal.deadline && (
													<span className='ml-4'>
														Deadline:{' '}
														{format(
															new Date(goal.deadline),
															'MMM dd, yyyy'
														)}
													</span>
												)}
											</div>
											<div className='flex items-center gap-4'>
												<span>
													{goal.donations.length} donation
													{goal.donations.length !== 1
														? 's'
														: ''}
												</span>
												<Button
													asChild
													variant='outline'
													size='sm'
												>
													<Link
														href={`/admin/goals/${goal.id}/edit`}
													>
														<Edit className='h-4 w-4 mr-1' />
														Edit
													</Link>
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</>
	);
}
