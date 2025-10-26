'use client';

import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
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

interface Subscriber {
	id: string;
	email: string;
	name?: string;
	status: 'active' | 'inactive';
	subscribedAt: string;
	lastEmailSent?: string;
	tags: string[];
}

export default function SubscribersPage() {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '' });
	const [addingSubscriber, setAddingSubscriber] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch('/api/auth/status');
				const data = await res.json();
				if (data.authenticated) {
					setUser(data.user);
					await fetchSubscribers();
				} else {
					window.location.href = '/admin';
				}
			} catch {
				window.location.href = '/admin';
			} finally {
				setLoading(false);
			}
		};
		checkAuth();
	}, []);

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

	if (loading) {
		return (
			<div className='py-8 text-center'>
				<div className='mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-primary'></div>
				<p className='text-muted-foreground'>Loading...</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Subscribers</h1>
					<p className='text-muted-foreground'>
						Manage your newsletter subscribers
					</p>
				</div>
				<div className='flex gap-2'>
					<Button variant='outline' onClick={handleExportSubscribers}>
						<Download className='w-4 h-4 mr-2' />
						Export
					</Button>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<UserPlus className='w-4 h-4 mr-2' />
								Add Subscriber
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Subscriber</DialogTitle>
								<DialogDescription>
									Add a new subscriber to your newsletter.
								</DialogDescription>
							</DialogHeader>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='email'>Email *</Label>
									<Input
										id='email'
										type='email'
										value={newSubscriber.email}
										onChange={(e) =>
											setNewSubscriber({
												...newSubscriber,
												email: e.target.value,
											})
										}
										placeholder='Enter email address'
									/>
								</div>
								<div>
									<Label htmlFor='name'>Name (Optional)</Label>
									<Input
										id='name'
										value={newSubscriber.name}
										onChange={(e) =>
											setNewSubscriber({
												...newSubscriber,
												name: e.target.value,
											})
										}
										placeholder='Enter name'
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
								<Button onClick={handleAddSubscriber} disabled={addingSubscriber}>
									{addingSubscriber ? 'Adding...' : 'Add Subscriber'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='flex-1'>
							<div className='relative'>
								<Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />
								<Input
									placeholder='Search subscribers...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className='w-full sm:w-48'>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Subscribers</SelectItem>
								<SelectItem value='active'>Active</SelectItem>
								<SelectItem value='inactive'>Inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Subscribers List */}
			<Card>
				<CardHeader>
					<CardTitle>
						Subscribers ({filteredSubscribers.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredSubscribers.length === 0 ? (
						<div className='text-center py-12'>
							<div className='mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4'>
								<Mail className='h-8 w-8 text-muted-foreground' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>
								{subscribers.length === 0
									? 'No subscribers yet'
									: 'No subscribers match your filters'}
							</h3>
							<p className='text-muted-foreground mb-4'>
								{subscribers.length === 0
									? 'Add your first subscriber to get started with your newsletter.'
									: 'Try adjusting your search or filter criteria.'}
							</p>
							{subscribers.length === 0 && (
								<Button onClick={() => setIsAddDialogOpen(true)}>
									<UserPlus className='h-4 w-4 mr-2' />
									Add Your First Subscriber
								</Button>
							)}
						</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Email</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Subscribed</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
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
															className='text-destructive hover:text-destructive'
														>
															<Trash2 className='w-4 h-4' />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Remove Subscriber
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to remove{' '}
																{subscriber.email} from your
																subscriber list? This action cannot be
																undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDeleteSubscriber(subscriber.id)
																}
																className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
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
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
