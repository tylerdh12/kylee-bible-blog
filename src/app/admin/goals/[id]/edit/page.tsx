'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/dashboard-layout';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Goal {
	id: string;
	title: string;
	description?: string;
	targetAmount: number;
	currentAmount: number;
	deadline?: string;
	completed: boolean;
}

export default function EditGoalPage() {
	const params = useParams();
	const router = useRouter();
	const goalId = params.id as string;

	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [targetAmount, setTargetAmount] = useState('');
	const [deadline, setDeadline] = useState('');
	const [completed, setCompleted] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch('/api/auth/status');
				const data = await res.json();
				if (data.authenticated) {
					setUser(data.user);
				} else {
					window.location.href = '/admin';
				}
			} catch {
				window.location.href = '/admin';
			}
		};
		checkAuth();
	}, []);

	useEffect(() => {
		const fetchGoal = async () => {
			try {
				const res = await fetch(
					`/api/admin/goals/${goalId}`
				);
				if (res.ok) {
					const data = await res.json();
					const goalData = data.goal;
					setTitle(goalData.title);
					setDescription(goalData.description || '');
					setTargetAmount(goalData.targetAmount.toString());
					setDeadline(
						goalData.deadline
							? new Date(goalData.deadline)
									.toISOString()
									.split('T')[0]
							: ''
					);
					setCompleted(goalData.completed);
				} else {
					alert('Goal not found');
					router.push('/admin/goals');
				}
			} catch (error) {
				console.error('Error fetching goal:', error);
				alert('Error loading goal');
				router.push('/admin/goals');
			} finally {
				setLoading(false);
			}
		};

		if (goalId) {
			fetchGoal();
		}
	}, [goalId, router]);

	const handleSave = async () => {
		if (
			!title.trim() ||
			!targetAmount ||
			parseFloat(targetAmount) <= 0
		) {
			alert('Title and valid target amount are required');
			return;
		}

		setSaving(true);
		try {
			const response = await fetch(
				`/api/admin/goals/${goalId}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title,
						description: description || null,
						targetAmount: parseFloat(targetAmount),
						deadline: deadline || null,
						completed,
					}),
				}
			);

			if (response.ok) {
				alert('Goal updated successfully!');
				router.push('/admin/goals');
			} else {
				alert('Failed to update goal');
			}
		} catch {
			alert('Error updating goal');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<DashboardLayout
				user={user}
				breadcrumbs={[
					{ label: 'Dashboard', href: '/admin' },
					{ label: 'Goals', href: '/admin/goals' },
					{ label: 'Edit Goal' },
				]}
				title='Edit Goal'
				description='Update your fundraising goal'
			>
				<div className='text-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading goal...
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
				{ label: 'Goals', href: '/admin/goals' },
				{ label: 'Edit Goal' },
			]}
			title='Edit Goal'
			description='Update your fundraising goal'
		>
			<Card>
				<CardHeader>
					<CardTitle>Update Goal</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='space-y-2'>
						<Label htmlFor='title'>Goal Title *</Label>
						<Input
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder='e.g., Bible Study Materials Fund'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Description</Label>
						<Textarea
							id='description'
							value={description}
							onChange={(e) =>
								setDescription(e.target.value)
							}
							placeholder='Describe what this goal will help accomplish...'
							rows={4}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='targetAmount'>
							Target Amount * ($)
						</Label>
						<Input
							id='targetAmount'
							type='number'
							step='0.01'
							min='1'
							value={targetAmount}
							onChange={(e) =>
								setTargetAmount(e.target.value)
							}
							placeholder='500.00'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='deadline'>
							Deadline (Optional)
						</Label>
						<Input
							id='deadline'
							type='date'
							value={deadline}
							onChange={(e) => setDeadline(e.target.value)}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='completed'>Status</Label>
						<div className='flex items-center space-x-2'>
							<input
								id='completed'
								type='checkbox'
								checked={completed}
								onChange={(e) =>
									setCompleted(e.target.checked)
								}
								className='rounded'
							/>
							<Label
								htmlFor='completed'
								className='text-sm'
							>
								Mark as completed
							</Label>
						</div>
					</div>

					<div className='flex gap-4 pt-4'>
						<Button
							onClick={handleSave}
							disabled={saving}
						>
							{saving ? 'Updating...' : 'Update Goal'}
						</Button>
						<Button
							variant='outline'
							onClick={() => router.push('/admin/goals')}
						>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</DashboardLayout>
	);
}
