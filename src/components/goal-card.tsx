import { format } from 'date-fns';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { ProgressBar } from './ui/progress-bar';
import { GoalCardProps } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

export function GoalCard({
	goal,
	showActions = false,
}: GoalCardProps) {
	const isCompleted =
		goal.currentAmount >= goal.targetAmount ||
		goal.completed;
	const { formatAmount } = useCurrency();

	return (
		<Card className='w-full'>
			<CardHeader>
				<div className='flex justify-between items-start'>
					<div className='space-y-2'>
						<CardTitle className='flex items-center gap-2'>
							{goal.title}
							{isCompleted && (
								<Badge
									variant='outline'
									className='text-green-600 border-green-600 dark:text-green-400 dark:border-green-400'
								>
									Completed
								</Badge>
							)}
						</CardTitle>
						{goal.description && (
							<p className='text-muted-foreground text-sm'>
								{goal.description}
							</p>
						)}
					</div>
					<div className='text-right'>
						<p className='text-2xl font-bold'>
							{formatAmount(goal.currentAmount)}
						</p>
						<p className='text-sm text-muted-foreground'>
							of {formatAmount(goal.targetAmount)}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<ProgressBar
					current={goal.currentAmount}
					target={goal.targetAmount}
				/>

				<div className='flex justify-between items-center text-sm text-muted-foreground'>
					<div className='space-x-4'>
						<span>
							Created:{' '}
							{format(
								new Date(goal.createdAt),
								'MMM dd, yyyy'
							)}
						</span>
						{goal.deadline && (
							<span>
								Deadline:{' '}
								{format(
									new Date(goal.deadline),
									'MMM dd, yyyy'
								)}
							</span>
						)}
					</div>
					<div>
						{goal.donations.length} donation
						{goal.donations.length !== 1 ? 's' : ''}
					</div>
				</div>

				{showActions && (
					<div className='flex gap-2 pt-2'>
						{/* Action buttons can be added here when needed */}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
