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
import { Badge } from '@/components/ui/badge';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar';
import {
	Users,
	Plus,
	Search,
	MoreHorizontal,
	Edit,
	Trash2,
	Shield,
	Mail,
	Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
	avatar?: string;
	createdAt: string;
	_count: {
		posts: number;
		comments: number;
	};
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users || []);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setLoading(false);
		}
	};

	const filteredUsers = users.filter(
		(user) =>
			user.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			user.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase())
	);

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return 'default';
			case 'DEVELOPER':
				return 'secondary';
			case 'SUBSCRIBER':
				return 'outline';
			default:
				return 'outline';
		}
	};

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>
					Loading users...
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Users
					</h1>
					<p className='text-muted-foreground'>
						Manage users and their permissions
					</p>
				</div>
				<Button>
					<Plus className='h-4 w-4 mr-2' />
					Add User
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center gap-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search users...'
								value={searchTerm}
								onChange={(e) =>
									setSearchTerm(e.target.value)
								}
								className='pl-10'
							/>
						</div>
						<div className='text-sm text-muted-foreground'>
							{filteredUsers.length} of {users.length} users
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Users List */}
			<div className='space-y-4'>
				{filteredUsers.length === 0 ? (
					<Card>
						<CardContent className='py-12'>
							<div className='text-center space-y-4'>
								<div className='mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center'>
									<Users className='h-8 w-8 text-muted-foreground' />
								</div>
								<div>
									<h3 className='text-lg font-semibold'>
										{searchTerm
											? 'No users found'
											: 'No users yet'}
									</h3>
									<p className='text-muted-foreground'>
										{searchTerm
											? 'Try adjusting your search terms'
											: 'Users will appear here when they register'}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				) : (
					filteredUsers.map((user) => (
						<Card key={user.id}>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-4'>
										<Avatar className='h-12 w-12'>
											<AvatarImage
												src={user.avatar}
												alt={user.name}
											/>
											<AvatarFallback>
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className='space-y-1'>
											<div className='flex items-center gap-2'>
												<h3 className='font-semibold'>
													{user.name}
												</h3>
												<Badge
													variant={getRoleBadgeVariant(
														user.role
													)}
												>
													<Shield className='h-3 w-3 mr-1' />
													{user.role}
												</Badge>
												{!user.isActive && (
													<Badge variant='destructive'>
														Inactive
													</Badge>
												)}
											</div>
											<div className='flex items-center gap-4 text-sm text-muted-foreground'>
												<div className='flex items-center gap-1'>
													<Mail className='h-3 w-3' />
													{user.email}
												</div>
												<div className='flex items-center gap-1'>
													<Calendar className='h-3 w-3' />
													Joined{' '}
													{format(
														new Date(user.createdAt),
														'MMM dd, yyyy'
													)}
												</div>
											</div>
											<div className='flex items-center gap-4 text-xs text-muted-foreground'>
												<span>
													{user._count.posts} posts
												</span>
												<span>
													{user._count.comments} comments
												</span>
											</div>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='ghost'
												size='sm'
											>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem>
												<Edit className='h-4 w-4 mr-2' />
												Edit User
											</DropdownMenuItem>
											<DropdownMenuItem className='text-destructive'>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete User
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
