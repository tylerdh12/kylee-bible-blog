'use client';

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

interface GoalsListClientProps {
	goals: Goal[];
}

export default function GoalsListClient({
	goals,
}: GoalsListClientProps) {
	const { formatAmount } = useCurrency();

	return (
		<>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex flex-col gap-2 items-start'>
					<h1 className='text-3xl font-bold'>Goals</h1>
					<p className='mt-1 text-muted-foreground'>
						Manage your ministry goals
					</p>
				</div>
				<Button asChild>
					<Link href='/admin/goals/new'>
						<Plus className='mr-2 w-4 h-4' />
						New Goal
					</Link>
				</Button>
			</div>

			{goals.length === 0 ? (
				<Card>
					<CardContent className='py-12'>
						<div className='space-y-4 text-center'>
							<div className='flex justify-center items-center mx-auto w-16 h-16 rounded-full bg-muted'>
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
									<Plus className='mr-2 w-4 h-4' />
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
											<CardTitle className='flex gap-2 items-center'>
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
												<p className='mt-2 text-muted-foreground'>
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
										<div className='w-full h-2 bg-gray-200 rounded-full'>
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
											<div className='flex gap-4 items-center'>
												<span>
													{goal.donations?.length || 0}{' '}
													donation
													{(goal.donations?.length || 0) !==
													1
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
														<Edit className='mr-1 w-4 h-4' />
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
