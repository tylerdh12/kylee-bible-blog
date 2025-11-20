'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import {
	Eye,
	FileText,
	Heart,
	HeartHandshake,
	MessageCircle,
	Plus,
	Target,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
	totalPosts: number;
	publishedPosts: number;
	totalGoals: number;
	activeGoals: number;
	totalDonations: number;
	totalDonationAmount: number;
	totalComments?: number;
	totalSubscribers?: number;
	totalPrayerRequests?: number;
}

export default function AdminPage() {
	const [isLoggedIn, setIsLoggedIn] = useState<
		boolean | null
	>(null);
	const [user, setUser] = useState<User | null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState<DashboardStats | null>(
		null
	);
	const [statsLoading, setStatsLoading] = useState(true);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	useEffect(() => {
		if (isLoggedIn) {
			fetchStats();
		}
	}, [isLoggedIn]);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch('/api/auth/status', {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (data.authenticated) {
				setIsLoggedIn(true);
				setUser(data.user);
			} else {
				setIsLoggedIn(false);
			}
		} catch {
			setIsLoggedIn(false);
		}
	};

	const fetchStats = async () => {
		try {
			const response = await fetch('/api/admin/stats');
			if (response.ok) {
				const data = await response.json();
				setStats(data);
			}
		} catch (error) {
			console.error('Error fetching stats:', error);
		} finally {
			setStatsLoading(false);
		}
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				const data = await response.json();
				setIsLoggedIn(true);
				setUser(data.user);
				setEmail('');
				setPassword('');
			} else {
				alert('Invalid credentials');
			}
		} catch {
			alert('Login failed');
		} finally {
			setLoading(false);
		}
	};

	// Show loading while checking auth status
	if (isLoggedIn === null) {
		return (
			<div
				className='flex justify-center items-center min-h-screen'
				role='main'
				aria-label='Loading admin dashboard'
			>
				<div className='text-center'>
					<div
						className='mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-primary'
						role='status'
						aria-label='Loading'
					></div>
					<p
						className='text-muted-foreground'
						aria-live='polite'
					>
						Loading...
					</p>
				</div>
			</div>
		);
	}

	// If logged in, show dashboard content (layout will handle the wrapper)
	if (isLoggedIn) {
		return (
			<div className='space-y-6'>
				{/* Welcome Section */}
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>
							Welcome back, {user?.name || 'Admin'}!
						</h1>
						<p className='text-muted-foreground'>
							Here's what's happening with your blog today.
						</p>
					</div>
					<div className='flex gap-2'>
						<Button
							asChild
							variant='outline'
						>
							<Link href='/admin/posts/new'>
								<Plus className='mr-2 w-4 h-4' />
								New Post
							</Link>
						</Button>
						<Button asChild>
							<Link href='/admin/goals/new'>
								<Target className='mr-2 w-4 h-4' />
								New Goal
							</Link>
						</Button>
					</div>
				</div>

				{/* Stats Overview */}
				{statsLoading ? (
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
						{Array.from({ length: 8 }).map((_, i) => (
							<Card key={`loading-stat-${i}`}>
								<CardContent className='p-6'>
									<div className='animate-pulse'>
										<div className='mb-2 w-3/4 h-4 rounded bg-muted'></div>
										<div className='w-1/2 h-8 rounded bg-muted'></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<FileText className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Total Posts
										</p>
										<p className='text-2xl font-bold'>
											{stats?.totalPosts || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<Eye className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Published
										</p>
										<p className='text-2xl font-bold'>
											{stats?.publishedPosts || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<MessageCircle className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Comments
										</p>
										<p className='text-2xl font-bold'>
											{stats?.totalComments || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<Users className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Subscribers
										</p>
										<p className='text-2xl font-bold'>
											{stats?.totalSubscribers || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<Target className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Active Goals
										</p>
										<p className='text-2xl font-bold'>
											{stats?.activeGoals || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<Heart className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Total Raised
										</p>
										<p className='text-2xl font-bold'>
											$
											{stats?.totalDonationAmount?.toFixed(
												2
											) || '0.00'}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<Heart className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Donations
										</p>
										<p className='text-2xl font-bold'>
											{stats?.totalDonations || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center'>
									<HeartHandshake className='w-4 h-4 text-muted-foreground' />
									<div className='ml-2'>
										<p className='text-sm font-medium text-muted-foreground'>
											Prayer Requests
										</p>
										<p className='text-2xl font-bold'>
											{stats?.totalPrayerRequests || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Quick Actions */}
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
					<Card>
						<CardHeader>
							<CardTitle className='flex gap-2 items-center'>
								<FileText className='w-5 h-5' />
								Posts
							</CardTitle>
							<CardDescription>
								Manage your blog posts
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Create and manage your blog content
								</p>
								<div className='flex gap-2'>
									<Button
										asChild
										className='flex-1'
									>
										<Link href='/admin/posts'>
											View Posts
										</Link>
									</Button>
									<Button
										asChild
										variant='outline'
									>
										<Link href='/admin/posts/new'>New</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex gap-2 items-center'>
								<Target className='w-5 h-5' />
								Goals
							</CardTitle>
							<CardDescription>
								Manage ministry goals
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Set up fundraising goals
								</p>
								<div className='flex gap-2'>
									<Button
										asChild
										className='flex-1'
									>
										<Link href='/admin/goals'>
											View Goals
										</Link>
									</Button>
									<Button
										asChild
										variant='outline'
									>
										<Link href='/admin/goals/new'>New</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex gap-2 items-center'>
								<Heart className='w-5 h-5' />
								Donations
							</CardTitle>
							<CardDescription>
								View donation history
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Track supporter contributions
								</p>
								<div className='flex gap-2'>
									<Button
										asChild
										className='flex-1'
									>
										<Link href='/admin/donations'>
											View Donations
										</Link>
									</Button>
									<Button
										asChild
										variant='outline'
									>
										<Link
											href='/donate'
											target='_blank'
										>
											Donate Page
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex gap-2 items-center'>
								<HeartHandshake className='w-5 h-5' />
								Prayer Requests
							</CardTitle>
							<CardDescription>
								Manage prayer requests
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Review and respond to prayer requests
								</p>
								<Button
									asChild
									className='w-full'
								>
									<Link href='/admin/prayer-requests'>
										View Requests
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex gap-2 items-center'>
								<MessageCircle className='w-5 h-5' />
								Comments
							</CardTitle>
							<CardDescription>
								Moderate comments
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Review and approve comments
								</p>
								<Button
									asChild
									className='w-full'
								>
									<Link href='/admin/comments'>
										View Comments
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex gap-2 items-center'>
								<Users className='w-5 h-5' />
								Subscribers
							</CardTitle>
							<CardDescription>
								Manage subscribers
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Manage newsletter subscribers
								</p>
								<Button
									asChild
									className='w-full'
								>
									<Link href='/admin/subscribers'>
										View Subscribers
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Show login form if not authenticated
	return (
		<div
			className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'
			role='main'
			aria-label='Admin login'
		>
			<div className='w-full max-w-md'>
				<Card className='shadow-xl'>
					<CardHeader className='pb-6 text-center'>
						<div
							className='flex justify-center items-center mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10'
							aria-hidden='true'
						>
							<div className='w-6 h-6 text-primary'>📝</div>
						</div>
						<CardTitle className='text-2xl'>
							Welcome Back
						</CardTitle>
						<CardDescription>
							Sign in to access your blog dashboard
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleLogin}
							className='space-y-4'
							aria-labelledby='login-title'
							aria-describedby='login-description'
						>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='Enter your email'
									required
									aria-describedby='email-help'
									autoComplete='email'
								/>
								<div
									id='email-help'
									className='sr-only'
								>
									Enter your registered email address
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder='Enter your password'
									required
									aria-describedby='password-help'
									autoComplete='current-password'
								/>
								<div
									id='password-help'
									className='sr-only'
								>
									Enter your password to access the admin
									dashboard
								</div>
							</div>
							<Button
								type='submit'
								className='w-full'
								disabled={loading}
								aria-describedby={
									loading ? 'login-status' : undefined
								}
							>
								{loading ? (
									<>
										<div
											className='mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin'
											role='status'
											aria-hidden='true'
										/>
										Signing in...
										<span
											className='sr-only'
											id='login-status'
										>
											Processing your login request, please
											wait
										</span>
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
