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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
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
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Users,
	UserPlus,
	Mail,
	Shield,
	Code,
	UserCheck,
	Send,
	Search,
	Filter,
	Edit,
	Trash2,
	MoreVertical,
	Eye,
	X,
	CheckCircle2,
	XCircle,
	Download,
	UserX,
	UserCheck2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsersTableSkeleton } from '@/components/skeletons/admin-skeletons';
import type { UserRole } from '@/types';

interface User {
	id: string;
	email: string;
	name: string | null;
	role: 'ADMIN' | 'DEVELOPER' | 'SUBSCRIBER';
	isActive: boolean;
	avatar?: string | null;
	bio?: string | null;
	website?: string | null;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	_count?: {
		posts: number;
		comments: number;
	};
}

interface Subscriber {
	id: string;
	email: string;
	name: string | null;
	status: string;
	subscribedAt: string;
}

export default function UsersEnhancedPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [usersPerPage] = useState(10);
	
	// Dialogs
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [messageDialogOpen, setMessageDialogOpen] = useState(false);
	const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
	
	// Form states
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [viewingUser, setViewingUser] = useState<User | null>(null);
	const [loadingUserDetails, setLoadingUserDetails] = useState(false);
	const [deletingUser, setDeletingUser] = useState<User | null>(null);
	const [messageSubject, setMessageSubject] = useState('');
	const [messageContent, setMessageContent] = useState('');
	const [sendingMessage, setSendingMessage] = useState(false);
	const [bulkAction, setBulkAction] = useState<string>('');
	
	// Create user form
	const [newUser, setNewUser] = useState<{
		email: string;
		password: string;
		name: string;
		role: UserRole;
		isActive: boolean;
	}>({
		email: '',
		password: '',
		name: '',
		role: 'SUBSCRIBER',
		isActive: true,
	});
	
	// Edit user form
	const [editForm, setEditForm] = useState<{
		email: string;
		name: string;
		role: UserRole;
		isActive: boolean;
		bio: string;
		website: string;
		avatar: string;
		password: string;
	}>({
		email: '',
		name: '',
		role: 'SUBSCRIBER',
		isActive: true,
		bio: '',
		website: '',
		avatar: '',
		password: '',
	});

	useEffect(() => {
		fetchUsers();
		fetchSubscribers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users || []);
			} else {
				toast.error('Failed to load users');
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Error loading users');
		} finally {
			setLoading(false);
		}
	};

	const fetchSubscribers = async () => {
		try {
			const response = await fetch('/api/admin/subscribers');
			if (response.ok) {
				const data = await response.json();
				setSubscribers(data.subscribers || []);
			}
		} catch (error) {
			console.error('Error fetching subscribers:', error);
		}
	};

	const handleCreateUser = async () => {
		if (!newUser.email || !newUser.password) {
			toast.error('Email and password are required');
			return;
		}

		try {
			const response = await fetch('/api/admin/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newUser),
			});

			if (response.ok) {
				toast.success('User created successfully');
				setCreateDialogOpen(false);
				setNewUser({
					email: '',
					password: '',
					name: '',
					role: 'SUBSCRIBER',
					isActive: true,
				});
				fetchUsers();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to create user');
			}
		} catch (error) {
			console.error('Error creating user:', error);
			toast.error('Error creating user');
		}
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setEditForm({
			email: user.email,
			name: user.name || '',
			role: user.role,
			isActive: user.isActive,
			bio: user.bio || '',
			website: user.website || '',
			avatar: user.avatar || '',
			password: '',
		});
		setEditDialogOpen(true);
	};

	const handleUpdateUser = async () => {
		if (!editingUser) return;

		try {
			const updateData: any = {
				email: editForm.email,
				name: editForm.name,
				role: editForm.role,
				isActive: editForm.isActive,
				bio: editForm.bio,
				website: editForm.website,
				avatar: editForm.avatar,
			};

			if (editForm.password) {
				updateData.password = editForm.password;
			}

			const response = await fetch(`/api/admin/users/${editingUser.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData),
			});

			if (response.ok) {
				toast.success('User updated successfully');
				setEditDialogOpen(false);
				setEditingUser(null);
				fetchUsers();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to update user');
			}
		} catch (error) {
			console.error('Error updating user:', error);
			toast.error('Error updating user');
		}
	};

	const handleDeleteUser = async () => {
		if (!deletingUser) return;

		try {
			const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('User deleted successfully');
				setDeleteDialogOpen(false);
				setDeletingUser(null);
				fetchUsers();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to delete user');
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			toast.error('Error deleting user');
		}
	};

	const handleBulkAction = async () => {
		if (selectedUsers.length === 0) {
			toast.error('Please select users first');
			return;
		}

		try {
			if (bulkAction === 'delete') {
				// Delete multiple users
				const deletePromises = selectedUsers.map((userId) =>
					fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
				);
				const results = await Promise.allSettled(deletePromises);
				const successCount = results.filter((r) => r.status === 'fulfilled').length;
				toast.success(`Deleted ${successCount} of ${selectedUsers.length} users`);
				setSelectedUsers([]);
				fetchUsers();
			} else if (bulkAction === 'activate') {
				// Activate multiple users
				const updatePromises = selectedUsers.map((userId) =>
					fetch(`/api/admin/users/${userId}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ isActive: true }),
					})
				);
				await Promise.allSettled(updatePromises);
				toast.success(`Activated ${selectedUsers.length} users`);
				setSelectedUsers([]);
				fetchUsers();
			} else if (bulkAction === 'deactivate') {
				// Deactivate multiple users
				const updatePromises = selectedUsers.map((userId) =>
					fetch(`/api/admin/users/${userId}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ isActive: false }),
					})
				);
				await Promise.allSettled(updatePromises);
				toast.success(`Deactivated ${selectedUsers.length} users`);
				setSelectedUsers([]);
				fetchUsers();
			} else if (bulkAction.startsWith('role:')) {
				// Change role for multiple users
				const newRole = bulkAction.split(':')[1];
				const updatePromises = selectedUsers.map((userId) =>
					fetch(`/api/admin/users/${userId}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ role: newRole }),
					})
				);
				await Promise.allSettled(updatePromises);
				toast.success(`Updated role for ${selectedUsers.length} users`);
				setSelectedUsers([]);
				fetchUsers();
			}
			setBulkActionDialogOpen(false);
			setBulkAction('');
		} catch (error) {
			console.error('Error performing bulk action:', error);
			toast.error('Error performing bulk action');
		}
	};

	const updateUserRole = async (userId: string, newRole: string) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole }),
			});

			if (response.ok) {
				toast.success('User role updated');
				fetchUsers();
			} else {
				toast.error('Failed to update role');
			}
		} catch (error) {
			console.error('Error updating user role:', error);
			toast.error('Error updating role');
		}
	};

	const toggleUserStatus = async (userId: string, isActive: boolean) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !isActive }),
			});

			if (response.ok) {
				toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
				fetchUsers();
			} else {
				toast.error('Failed to update status');
			}
		} catch (error) {
			console.error('Error toggling user status:', error);
			toast.error('Error updating status');
		}
	};

	const sendMessage = async () => {
		if (!messageSubject || !messageContent) {
			toast.error('Please fill in both subject and message');
			return;
		}

		setSendingMessage(true);
		try {
			const response = await fetch('/api/admin/messages/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					recipientIds: selectedUsers,
					subject: messageSubject,
					content: messageContent,
				}),
			});

			if (response.ok) {
				toast.success(`Message sent to ${selectedUsers.length} user(s)`);
				setMessageDialogOpen(false);
				setMessageSubject('');
				setMessageContent('');
				setSelectedUsers([]);
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to send message');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Error sending message');
		} finally {
			setSendingMessage(false);
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.name?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === 'all' || user.role === roleFilter;
		const matchesStatus = statusFilter === 'all' || 
			(statusFilter === 'active' && user.isActive) ||
			(statusFilter === 'inactive' && !user.isActive);
		return matchesSearch && matchesRole && matchesStatus;
	});

	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * usersPerPage,
		currentPage * usersPerPage
	);
	const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return 'destructive';
			case 'DEVELOPER':
				return 'default';
			case 'SUBSCRIBER':
				return 'secondary';
			default:
				return 'outline';
		}
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return <Shield className="h-3 w-3" />;
			case 'DEVELOPER':
				return <Code className="h-3 w-3" />;
			case 'SUBSCRIBER':
				return <UserCheck className="h-3 w-3" />;
			default:
				return <Users className="h-3 w-3" />;
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedUsers(paginatedUsers.map((u) => u.id));
		} else {
			setSelectedUsers([]);
		}
	};

	const handleSelectUser = (userId: string, checked: boolean) => {
		if (checked) {
			setSelectedUsers([...selectedUsers, userId]);
		} else {
			setSelectedUsers(selectedUsers.filter((id) => id !== userId));
		}
	};

	const exportUsers = () => {
		const csv = [
			['Email', 'Name', 'Role', 'Status', 'Posts', 'Comments', 'Created At'].join(','),
			...filteredUsers.map((user) =>
				[
					user.email,
					user.name || '',
					user.role,
					user.isActive ? 'Active' : 'Inactive',
					user._count?.posts || 0,
					user._count?.comments || 0,
					format(new Date(user.createdAt), 'yyyy-MM-dd'),
				].join(',')
			),
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
		toast.success('Users exported successfully');
	};

	if (loading) {
		return <UsersTableSkeleton />;
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						User Management
					</h1>
					<p className='text-muted-foreground'>
						Manage users, roles, permissions, and send messages
					</p>
				</div>
				<div className='flex gap-2'>
					<Button variant='outline' onClick={exportUsers}>
						<Download className='h-4 w-4 mr-2' />
						Export
					</Button>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<UserPlus className='h-4 w-4 mr-2' />
						Create User
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid gap-4 md:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{users.length}</div>
						<p className='text-xs text-muted-foreground'>
							{users.filter((u) => u.isActive).length} active
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Admins</CardTitle>
						<Shield className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{users.filter((u) => u.role === 'ADMIN').length}
						</div>
						<p className='text-xs text-muted-foreground'>Administrators</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Developers</CardTitle>
						<Code className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{users.filter((u) => u.role === 'DEVELOPER').length}
						</div>
						<p className='text-xs text-muted-foreground'>Developers</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Subscribers</CardTitle>
						<Mail className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{users.filter((u) => u.role === 'SUBSCRIBER').length}
						</div>
						<p className='text-xs text-muted-foreground'>Subscribers</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue='users' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='users'>
						<Users className='h-4 w-4 mr-2' />
						Users ({users.length})
					</TabsTrigger>
					<TabsTrigger value='subscribers'>
						<Mail className='h-4 w-4 mr-2' />
						Subscribers ({subscribers.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='users' className='space-y-4'>
					{/* Filters and Bulk Actions */}
					<Card>
						<CardContent className='pt-6'>
							<div className='flex flex-col md:flex-row gap-4 items-start md:items-center'>
								<div className='flex-1 relative w-full md:w-auto'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
									<Input
										placeholder='Search users by name or email...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className='pl-10'
									/>
								</div>
								<Select value={roleFilter} onValueChange={setRoleFilter}>
									<SelectTrigger className='w-full md:w-[180px]'>
										<SelectValue placeholder='Filter by role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Roles</SelectItem>
										<SelectItem value='ADMIN'>Admin</SelectItem>
										<SelectItem value='DEVELOPER'>Developer</SelectItem>
										<SelectItem value='SUBSCRIBER'>Subscriber</SelectItem>
									</SelectContent>
								</Select>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className='w-full md:w-[180px]'>
										<SelectValue placeholder='Filter by status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Status</SelectItem>
										<SelectItem value='active'>Active</SelectItem>
										<SelectItem value='inactive'>Inactive</SelectItem>
									</SelectContent>
								</Select>
								{selectedUsers.length > 0 && (
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setBulkActionDialogOpen(true)}
										>
											Bulk Actions ({selectedUsers.length})
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setMessageDialogOpen(true)}
										>
											<Send className='h-4 w-4 mr-2' />
											Send Message
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => setSelectedUsers([])}
										>
											<X className='h-4 w-4' />
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Users Table */}
					<Card>
						<CardHeader>
							<CardTitle>Users</CardTitle>
							<CardDescription>
								{filteredUsers.length} user(s) found
							</CardDescription>
						</CardHeader>
						<CardContent>
							{filteredUsers.length === 0 ? (
								<div className='text-center py-8'>
									<Users className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
									<p className='text-muted-foreground'>No users found</p>
								</div>
							) : (
								<>
									<div className='rounded-md border'>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className='w-12'>
														<Checkbox
															checked={
																selectedUsers.length === paginatedUsers.length &&
																paginatedUsers.length > 0
															}
															onCheckedChange={handleSelectAll}
														/>
													</TableHead>
													<TableHead>User</TableHead>
													<TableHead>Role</TableHead>
													<TableHead>Status</TableHead>
													<TableHead>Posts</TableHead>
													<TableHead>Comments</TableHead>
													<TableHead>Created</TableHead>
													<TableHead className='text-right'>Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginatedUsers.map((user) => (
													<TableRow key={user.id}>
														<TableCell>
															<Checkbox
																checked={selectedUsers.includes(user.id)}
																onCheckedChange={(checked) =>
																	handleSelectUser(user.id, checked as boolean)
																}
															/>
														</TableCell>
														<TableCell>
															<div className='flex items-center gap-3'>
																<Avatar className='h-8 w-8'>
																	<AvatarImage
																		src={user.avatar || user.image || undefined}
																	/>
																	<AvatarFallback>
																		{user.name
																			? user.name
																					.split(' ')
																					.map((n) => n[0])
																					.join('')
																					.toUpperCase()
																			: user.email[0].toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<div>
																	<div className='font-medium'>
																		{user.name || 'No name'}
																	</div>
																	<div className='text-sm text-muted-foreground'>
																		{user.email}
																	</div>
																</div>
															</div>
														</TableCell>
														<TableCell>
															<Badge
																variant={getRoleBadgeVariant(user.role)}
																className='flex items-center gap-1 w-fit'
															>
																{getRoleIcon(user.role)}
																{user.role}
															</Badge>
														</TableCell>
														<TableCell>
															{user.isActive ? (
																<Badge variant='outline' className='text-green-600'>
																	<CheckCircle2 className='h-3 w-3 mr-1' />
																	Active
																</Badge>
															) : (
																<Badge variant='outline' className='text-red-600'>
																	<XCircle className='h-3 w-3 mr-1' />
																	Inactive
																</Badge>
															)}
														</TableCell>
														<TableCell>{user._count?.posts || 0}</TableCell>
														<TableCell>{user._count?.comments || 0}</TableCell>
														<TableCell>
															{format(new Date(user.createdAt), 'MMM d, yyyy')}
														</TableCell>
														<TableCell className='text-right'>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant='ghost' size='sm'>
																		<MoreVertical className='h-4 w-4' />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align='end'>
																	<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={async () => {
											setViewingUser(user);
											setViewDialogOpen(true);
											// Fetch full user details
											try {
												setLoadingUserDetails(true);
												const response = await fetch(`/api/admin/users/${user.id}`);
												if (response.ok) {
													const data = await response.json();
													setViewingUser(data.user);
												}
											} catch (error) {
												console.error('Error fetching user details:', error);
											} finally {
												setLoadingUserDetails(false);
											}
										}}
									>
										<Eye className='h-4 w-4 mr-2' />
										View Details
									</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() => handleEditUser(user)}
																	>
																		<Edit className='h-4 w-4 mr-2' />
																		Edit User
																	</DropdownMenuItem>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		onClick={() => updateUserRole(user.id, user.role === 'ADMIN' ? 'DEVELOPER' : user.role === 'DEVELOPER' ? 'SUBSCRIBER' : 'ADMIN')}
																	>
																		<Shield className='h-4 w-4 mr-2' />
																		Change Role
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() => toggleUserStatus(user.id, user.isActive)}
																	>
																		{user.isActive ? (
																			<>
																				<UserX className='h-4 w-4 mr-2' />
																				Deactivate
																			</>
																		) : (
																			<>
																				<UserCheck2 className='h-4 w-4 mr-2' />
																				Activate
																			</>
																		)}
																	</DropdownMenuItem>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		className='text-red-600'
																		onClick={() => {
																			setDeletingUser(user);
																			setDeleteDialogOpen(true);
																		}}
																	>
																		<Trash2 className='h-4 w-4 mr-2' />
																		Delete User
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>

									{/* Pagination */}
									{totalPages > 1 && (
										<div className='flex items-center justify-between mt-4'>
											<div className='text-sm text-muted-foreground'>
												Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
												{Math.min(currentPage * usersPerPage, filteredUsers.length)} of{' '}
												{filteredUsers.length} users
											</div>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
													disabled={currentPage === 1}
												>
													Previous
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														setCurrentPage((p) => Math.min(totalPages, p + 1))
													}
													disabled={currentPage === totalPages}
												>
													Next
												</Button>
											</div>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='subscribers' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Subscribers</CardTitle>
							<CardDescription>
								Manage newsletter subscribers and send bulk messages
							</CardDescription>
						</CardHeader>
						<CardContent>
							{subscribers.length === 0 ? (
								<div className='text-center py-8'>
									<Mail className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
									<p className='text-muted-foreground'>No subscribers yet</p>
								</div>
							) : (
								<div className='space-y-4'>
									{subscribers.map((subscriber) => (
										<div
											key={subscriber.id}
											className='flex items-center justify-between p-4 border rounded-lg'
										>
											<div>
												<p className='font-medium'>
													{subscriber.name || subscriber.email}
												</p>
												<p className='text-sm text-muted-foreground'>
													{subscriber.email}
												</p>
												<p className='text-xs text-muted-foreground mt-1'>
													Subscribed:{' '}
													{format(new Date(subscriber.subscribedAt), 'MMM d, yyyy')}
												</p>
											</div>
											<Badge variant='outline'>{subscriber.status}</Badge>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Create User Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Create New User</DialogTitle>
						<DialogDescription>
							Create a new user account with email and password
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='new-email'>Email *</Label>
							<Input
								id='new-email'
								type='email'
								value={newUser.email}
								onChange={(e) =>
									setNewUser({ ...newUser, email: e.target.value })
								}
								placeholder='user@example.com'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='new-password'>Password *</Label>
							<Input
								id='new-password'
								type='password'
								value={newUser.password}
								onChange={(e) =>
									setNewUser({ ...newUser, password: e.target.value })
								}
								placeholder='Minimum 8 characters'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='new-name'>Name</Label>
							<Input
								id='new-name'
								value={newUser.name}
								onChange={(e) =>
									setNewUser({ ...newUser, name: e.target.value })
								}
								placeholder='Full name (optional)'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='new-role'>Role</Label>
							<Select
								value={newUser.role}
								onValueChange={(value) =>
									setNewUser({ ...newUser, role: value as UserRole })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='SUBSCRIBER'>Subscriber</SelectItem>
									<SelectItem value='DEVELOPER'>Developer</SelectItem>
									<SelectItem value='ADMIN'>Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='new-active'
								checked={newUser.isActive}
								onCheckedChange={(checked) =>
									setNewUser({ ...newUser, isActive: checked as boolean })
								}
							/>
							<Label htmlFor='new-active' className='cursor-pointer'>
								User is active
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateUser}>Create User</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit User Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Update user information and settings
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit-email'>Email *</Label>
								<Input
									id='edit-email'
									type='email'
									value={editForm.email}
									onChange={(e) =>
										setEditForm({ ...editForm, email: e.target.value })
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-name'>Name</Label>
								<Input
									id='edit-name'
									value={editForm.name}
									onChange={(e) =>
										setEditForm({ ...editForm, name: e.target.value })
									}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit-role'>Role</Label>
								<Select
									value={editForm.role}
									onValueChange={(value) =>
										setEditForm({ ...editForm, role: value as UserRole })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='SUBSCRIBER'>Subscriber</SelectItem>
										<SelectItem value='DEVELOPER'>Developer</SelectItem>
										<SelectItem value='ADMIN'>Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-password'>New Password</Label>
								<Input
									id='edit-password'
									type='password'
									value={editForm.password}
									onChange={(e) =>
										setEditForm({ ...editForm, password: e.target.value })
									}
									placeholder='Leave empty to keep current'
								/>
							</div>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-bio'>Bio</Label>
							<Textarea
								id='edit-bio'
								value={editForm.bio}
								onChange={(e) =>
									setEditForm({ ...editForm, bio: e.target.value })
								}
								placeholder='User bio...'
								rows={3}
							/>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit-website'>Website</Label>
								<Input
									id='edit-website'
									type='url'
									value={editForm.website}
									onChange={(e) =>
										setEditForm({ ...editForm, website: e.target.value })
									}
									placeholder='https://example.com'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit-avatar'>Avatar URL</Label>
								<Input
									id='edit-avatar'
									type='url'
									value={editForm.avatar}
									onChange={(e) =>
										setEditForm({ ...editForm, avatar: e.target.value })
									}
									placeholder='https://example.com/avatar.jpg'
								/>
							</div>
						</div>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='edit-active'
								checked={editForm.isActive}
								onCheckedChange={(checked) =>
									setEditForm({ ...editForm, isActive: checked as boolean })
								}
							/>
							<Label htmlFor='edit-active' className='cursor-pointer'>
								User is active
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateUser}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View User Dialog */}
			<Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>User Details</DialogTitle>
						<DialogDescription>
							View detailed information about this user
						</DialogDescription>
					</DialogHeader>
					{loadingUserDetails ? (
						<div className='text-center py-8'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
							<p className='text-muted-foreground'>Loading user details...</p>
						</div>
					) : viewingUser ? (
						<div className='space-y-6'>
							<div className='flex items-center gap-4'>
								<Avatar className='h-20 w-20'>
									<AvatarImage
										src={viewingUser.avatar || viewingUser.image || undefined}
									/>
									<AvatarFallback className='text-lg'>
										{viewingUser.name
											? viewingUser.name
													.split(' ')
													.map((n) => n[0])
													.join('')
													.toUpperCase()
											: viewingUser.email[0].toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className='flex-1'>
									<h3 className='text-xl font-semibold'>
										{viewingUser.name || 'No name'}
									</h3>
									<p className='text-muted-foreground'>{viewingUser.email}</p>
									<div className='flex gap-2 mt-2'>
										<Badge variant={getRoleBadgeVariant(viewingUser.role)}>
											{viewingUser.role}
										</Badge>
										{viewingUser.isActive ? (
											<Badge variant='outline' className='text-green-600'>
												Active
											</Badge>
										) : (
											<Badge variant='outline' className='text-red-600'>
												Inactive
											</Badge>
										)}
										{viewingUser.emailVerified && (
											<Badge variant='outline'>Verified</Badge>
										)}
									</div>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label className='text-muted-foreground'>Bio</Label>
									<p className='mt-1'>
										{viewingUser.bio || <span className='text-muted-foreground'>No bio</span>}
									</p>
								</div>
								<div>
									<Label className='text-muted-foreground'>Website</Label>
									<p className='mt-1'>
										{viewingUser.website ? (
											<a
												href={viewingUser.website}
												target='_blank'
												rel='noopener noreferrer'
												className='text-primary hover:underline'
											>
												{viewingUser.website}
											</a>
										) : (
											<span className='text-muted-foreground'>No website</span>
										)}
									</p>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label className='text-muted-foreground'>Posts</Label>
									<p className='mt-1 text-2xl font-bold'>
										{viewingUser._count?.posts || 0}
									</p>
								</div>
								<div>
									<Label className='text-muted-foreground'>Comments</Label>
									<p className='mt-1 text-2xl font-bold'>
										{viewingUser._count?.comments || 0}
									</p>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label className='text-muted-foreground'>Created</Label>
									<p className='mt-1'>
										{format(new Date(viewingUser.createdAt), 'PPP')}
									</p>
								</div>
								<div>
									<Label className='text-muted-foreground'>Last Updated</Label>
									<p className='mt-1'>
										{format(new Date(viewingUser.updatedAt), 'PPP')}
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className='text-center py-8'>
							<p className='text-muted-foreground'>No user selected</p>
						</div>
					)}
					<DialogFooter>
						<Button variant='outline' onClick={() => setViewDialogOpen(false)}>
							Close
						</Button>
						{viewingUser && (
							<Button onClick={() => {
								setViewDialogOpen(false);
								handleEditUser(viewingUser);
							}}>
								<Edit className='h-4 w-4 mr-2' />
								Edit User
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete User Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the user account for{' '}
							<strong>{deletingUser?.email}</strong>. This action cannot be undone.
							{deletingUser?.role === 'ADMIN' && (
								<Alert className='mt-2'>
									<AlertDescription>
										Warning: You are deleting an admin user. Make sure there are
										other admin users remaining.
									</AlertDescription>
								</Alert>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDeletingUser(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteUser}
							className='bg-red-600 hover:bg-red-700'
						>
							Delete User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Bulk Action Dialog */}
			<Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Bulk Action</DialogTitle>
						<DialogDescription>
							Perform an action on {selectedUsers.length} selected user(s)
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<Select value={bulkAction} onValueChange={setBulkAction}>
							<SelectTrigger>
								<SelectValue placeholder='Select action' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='activate'>
									<UserCheck2 className='h-4 w-4 mr-2 inline' />
									Activate Users
								</SelectItem>
								<SelectItem value='deactivate'>
									<UserX className='h-4 w-4 mr-2 inline' />
									Deactivate Users
								</SelectItem>
								<SelectItem value='role:SUBSCRIBER'>
									<Users className='h-4 w-4 mr-2 inline' />
									Set Role: Subscriber
								</SelectItem>
								<SelectItem value='role:DEVELOPER'>
									<Code className='h-4 w-4 mr-2 inline' />
									Set Role: Developer
								</SelectItem>
								<SelectItem value='role:ADMIN'>
									<Shield className='h-4 w-4 mr-2 inline' />
									Set Role: Admin
								</SelectItem>
								<SelectItem value='delete' className='text-red-600'>
									<Trash2 className='h-4 w-4 mr-2 inline' />
									Delete Users
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setBulkActionDialogOpen(false);
								setBulkAction('');
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleBulkAction}
							disabled={!bulkAction}
							variant={bulkAction === 'delete' ? 'destructive' : 'default'}
						>
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Send Message Dialog */}
			<Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send Message</DialogTitle>
						<DialogDescription>
							Send a message to {selectedUsers.length} selected user(s)
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='subject'>Subject</Label>
							<Input
								id='subject'
								value={messageSubject}
								onChange={(e) => setMessageSubject(e.target.value)}
								placeholder='Message subject'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='content'>Message</Label>
							<Textarea
								id='content'
								value={messageContent}
								onChange={(e) => setMessageContent(e.target.value)}
								placeholder='Your message content...'
								rows={8}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setMessageDialogOpen(false);
								setMessageSubject('');
								setMessageContent('');
							}}
						>
							Cancel
						</Button>
						<Button onClick={sendMessage} disabled={sendingMessage}>
							{sendingMessage ? 'Sending...' : 'Send Message'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
