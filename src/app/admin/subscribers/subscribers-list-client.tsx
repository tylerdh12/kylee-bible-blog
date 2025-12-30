'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Search, Mail, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SubscribersListSkeleton } from '@/components/skeletons/subscribers-skeleton';

interface Subscriber {
	id: string;
	email: string;
	name?: string;
	status: string;
	subscribedAt: string;
	lastEmailSent?: string;
	tags: string[];
}

interface SubscribersListClientProps {
	initialSubscribers: Subscriber[];
}

export default function SubscribersListClient({ initialSubscribers }: SubscribersListClientProps) {
	const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
	const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>(initialSubscribers);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '' });
	const [addingSubscriber, setAddingSubscriber] = useState(false);

	useEffect(() => {
		let filtered = subscribers;

		if (searchQuery) {
			filtered = filtered.filter(
				(sub) =>
					sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
					sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (statusFilter !== 'all') {
			filtered = filtered.filter((sub) => sub.status === statusFilter);
		}

		setFilteredSubscribers(filtered);
	}, [subscribers, searchQuery, statusFilter]);

	const fetchSubscribers = async () => {
		try {
			const res = await fetch('/api/admin/subscribers');
			if (res.ok) {
				const data = await res.json();
				setSubscribers(data.subscribers || []);
			}
		} catch (error) {
			console.error('Failed to fetch subscribers:', error);
			toast.error('Failed to load subscribers');
		}
	};

	const handleAddSubscriber = async () => {
		if (!newSubscriber.email) {
			toast.error('Email is required');
			return;
		}

		setAddingSubscriber(true);
		try {
			const res = await fetch('/api/admin/subscribers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newSubscriber),
			});

			if (res.ok) {
				toast.success('Subscriber added successfully');
				setNewSubscriber({ email: '', name: '' });
				setIsAddDialogOpen(false);
				await fetchSubscribers();
			} else {
				const data = await res.json();
				toast.error(data.error || 'Failed to add subscriber');
			}
		} catch (error) {
			console.error('Failed to add subscriber:', error);
			toast.error('Failed to add subscriber');
		} finally {
			setAddingSubscriber(false);
		}
	};

	const handleDeleteSubscriber = async (id: string) => {
		try {
			const res = await fetch(`/api/admin/subscribers/${id}`, {
				method: 'DELETE',
			});

			if (res.ok) {
				toast.success('Subscriber removed successfully');
				await fetchSubscribers();
			} else {
				toast.error('Failed to remove subscriber');
			}
		} catch (error) {
			console.error('Failed to delete subscriber:', error);
			toast.error('Failed to remove subscriber');
		}
	};

	const handleExportSubscribers = () => {
		const csvContent = [
			['Email', 'Name', 'Status', 'Subscribed Date'],
			...filteredSubscribers.map((sub) => [
				sub.email,
				sub.name || '',
				sub.status,
				format(new Date(sub.subscribedAt), 'yyyy-MM-dd'),
			]),
		]
			.map((row) => row.join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Subscribers exported successfully');
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Subscribers
					</h1>
					<p className='text-muted-foreground'>
						Manage your newsletter subscribers
					</p>
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						onClick={handleExportSubscribers}
					>
						<Download className='mr-2 h-4 w-4' />
						Export
					</Button>
					<Dialog
						open={isAddDialogOpen}
						onOpenChange={setIsAddDialogOpen}
					>
						<DialogTrigger asChild>
							<Button>
								<UserPlus className='mr-2 h-4 w-4' />
								Add Subscriber
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Subscriber</DialogTitle>
								<DialogDescription>
									Add a new subscriber to your newsletter
									list.
								</DialogDescription>
							</DialogHeader>
							<div className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email *</Label>
									<Input
										id='email'
										type='email'
										placeholder='subscriber@example.com'
										value={newSubscriber.email}
										onChange={(e) =>
											setNewSubscriber({
												...newSubscriber,
												email: e.target.value,
											})
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='name'>Name (Optional)</Label>
									<Input
										id='name'
										placeholder='Subscriber Name'
										value={newSubscriber.name}
										onChange={(e) =>
											setNewSubscriber({
												...newSubscriber,
												name: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant='outline'
									onClick={() => setIsAddDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleAddSubscriber}
									disabled={addingSubscriber}
								>
									{addingSubscriber
										? 'Adding...'
										: 'Add Subscriber'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='flex-1'>
							<div className='relative'>
								<Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />
								<Input
									placeholder='Search subscribers...'
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className='pl-10'
								/>
							</div>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
						>
							<SelectTrigger className='w-full sm:w-48'>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='active'>Active</SelectItem>
								<SelectItem value='inactive'>
									Inactive
								</SelectItem>
								<SelectItem value='unsubscribed'>
									Unsubscribed
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Subscribers Table */}
			<Card>
				<CardHeader>
					<CardTitle>
						{filteredSubscribers.length} Subscriber
						{filteredSubscribers.length !== 1 ? 's' : ''}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredSubscribers.length === 0 ? (
						<div className='py-12 text-center'>
							<Mail className='mx-auto mb-4 w-12 h-12 text-muted-foreground' />
							<h3 className='mb-2 text-xl font-semibold'>
								No Subscribers Found
							</h3>
							<p className='text-muted-foreground'>
								{searchQuery || statusFilter !== 'all'
									? 'Try adjusting your search or filters'
									: 'Start building your subscriber list'}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Subscribed</TableHead>
									<TableHead className='text-right'>
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredSubscribers.map((subscriber) => (
									<TableRow key={subscriber.id}>
										<TableCell className='font-medium'>
											{subscriber.email}
										</TableCell>
										<TableCell>
											{subscriber.name || '-'}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													subscriber.status === 'active'
														? 'default'
														: 'secondary'
												}
											>
												{subscriber.status}
											</Badge>
										</TableCell>
										<TableCell>
											{format(
												new Date(subscriber.subscribedAt),
												'MMM dd, yyyy'
											)}
										</TableCell>
										<TableCell className='text-right'>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant='ghost'
														size='sm'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Remove Subscriber?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This will remove{' '}
															{subscriber.email}{' '}
															from your subscriber
															list. This action
															cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() =>
																handleDeleteSubscriber(
																	subscriber.id
																)
															}
														>
															Remove
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
