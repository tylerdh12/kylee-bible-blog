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
import { Separator } from '@/components/ui/separator';
import {
	Eye,
	FileText,
	Heart,
	HeartHandshake,
	MessageCircle,
	Plus,
	Target,
	Users,
	Key,
} from 'lucide-react';
import { authClient, useSession } from '@/lib/better-auth-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardStatsSkeleton } from '@/components/skeletons/admin-skeletons';

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
	const { data: session, isPending: sessionLoading } = useSession();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [statsLoading, setStatsLoading] = useState(true);

	// Check passkey support on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			setPasskeySupported(typeof window.PublicKeyCredential !== 'undefined');
		}
	}, []);

	// Fetch stats when authenticated
	useEffect(() => {
		if (session?.user) {
			fetchStats();
		}
	}, [session?.user]);

	// Check if user has ADMIN role
	const isAdmin = session?.user && (session.user as any).role === 'ADMIN';

	// Redirect non-admin users
	useEffect(() => {
		if (session?.user && !isAdmin) {
			window.location.href = '/';
		}
	}, [session?.user, isAdmin]);

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
		setLoginError(null);

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});

			if (result.error) {
				// Handle specific error codes
				const errorCode = result.error.code;
				const errorMessage = result.error.message;

				if (errorCode === 'INVALID_EMAIL_OR_PASSWORD') {
					setLoginError('Invalid email or password. Please try again.');
				} else if (errorCode === 'USER_NOT_FOUND') {
					setLoginError('No account found with this email.');
				} else if (errorMessage?.includes('Access denied') || errorMessage?.includes('Subscribers cannot')) {
					setLoginError('Access denied. Admin privileges required.');
				} else {
					setLoginError(errorMessage || 'Login failed. Please try again.');
				}
				return;
			}

			// Login successful - session will be updated automatically by useSession
			setEmail('');
			setPassword('');

			// Dispatch event for layout to pick up
			window.dispatchEvent(new CustomEvent('auth-changed', {
				detail: { authenticated: true, user: result.data?.user }
			}));

			// Reload to ensure fresh state
			window.location.reload();
		} catch (error: any) {
			console.error('Login error:', error);
			setLoginError(error?.message || 'Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Handle passkey sign-in
	const handlePasskeySignIn = async () => {
		setPasskeyLoading(true);
		setLoginError(null);

		try {
			if (typeof window === 'undefined' || typeof window.PublicKeyCredential === 'undefined') {
				setLoginError('Passkeys are not supported in this browser.');
				return;
			}

			const passkeySignIn = (authClient.signIn as any)?.passkey;
			if (!passkeySignIn || typeof passkeySignIn !== 'function') {
				setLoginError('Passkey sign-in is not available.');
				return;
			}

			const result = await passkeySignIn();

			if (result?.error) {
				const errorCode = result.error.code || result.error.name || '';
				const errorMsg = (result.error.message || '').toLowerCase();

				if (errorCode === 'NotAllowedError' || errorCode === 'AbortError' || errorMsg.includes('cancel')) {
					// User cancelled - no error message needed
					return;
				}

				setLoginError(result.error.message || 'Passkey sign-in failed.');
				return;
			}

			// Success - reload page
			window.dispatchEvent(new CustomEvent('auth-changed', {
				detail: { authenticated: true, user: result?.data?.user }
			}));
			window.location.reload();
		} catch (error: any) {
			if (error?.name === 'NotAllowedError' || error?.message?.includes('cancel')) {
				return; // User cancelled
			}
			console.error('Passkey sign-in error:', error);
			setLoginError(error?.message || 'Passkey sign-in failed.');
		} finally {
			setPasskeyLoading(false);
		}
	};

	const isPasskeySupported = () => passkeySupported === true;

	// Show loading while checking session
	if (sessionLoading) {
		return <DashboardStatsSkeleton />;
	}

	// If logged in as admin, show dashboard
	if (session?.user && isAdmin) {
		const user = session.user;
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
						<Button asChild variant='outline'>
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
					<DashboardStatsSkeleton />
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
											${stats?.totalDonationAmount?.toFixed(2) || '0.00'}
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
							<CardDescription>Manage your blog posts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Create and manage your blog content
								</p>
								<div className='flex gap-2'>
									<Button asChild className='flex-1'>
										<Link href='/admin/posts'>View Posts</Link>
									</Button>
									<Button asChild variant='outline'>
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
							<CardDescription>Manage ministry goals</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Set up fundraising goals
								</p>
								<div className='flex gap-2'>
									<Button asChild className='flex-1'>
										<Link href='/admin/goals'>View Goals</Link>
									</Button>
									<Button asChild variant='outline'>
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
							<CardDescription>View donation history</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Track supporter contributions
								</p>
								<div className='flex gap-2'>
									<Button asChild className='flex-1'>
										<Link href='/admin/donations'>View Donations</Link>
									</Button>
									<Button asChild variant='outline'>
										<Link href='/donate' target='_blank'>
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
							<CardDescription>Manage prayer requests</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Review and respond to prayer requests
								</p>
								<Button asChild className='w-full'>
									<Link href='/admin/prayer-requests'>View Requests</Link>
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
							<CardDescription>Moderate comments</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Review and approve comments
								</p>
								<Button asChild className='w-full'>
									<Link href='/admin/comments'>View Comments</Link>
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
							<CardDescription>Manage subscribers</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									Manage newsletter subscribers
								</p>
								<Button asChild className='w-full'>
									<Link href='/admin/subscribers'>View Subscribers</Link>
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
						<CardTitle className='text-2xl'>Welcome Back</CardTitle>
						<CardDescription>
							Sign in to access your blog dashboard
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className='space-y-4'>
							{loginError && (
								<div className='p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md'>
									{loginError}
								</div>
							)}
							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='Enter your email'
									required
									autoComplete='email'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder='Enter your password'
									required
									autoComplete='current-password'
								/>
							</div>
							<div className='flex items-center justify-between'>
								<Link
									href='/admin/reset-password'
									className='text-sm text-primary hover:underline'
								>
									Forgot password?
								</Link>
							</div>
							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? (
									<>
										<div
											className='mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin'
											role='status'
										/>
										Signing in...
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						{/* Passkey Sign-In Option */}
						{isPasskeySupported() && (
							<>
								<div className='relative my-6'>
									<div className='absolute inset-0 flex items-center'>
										<Separator />
									</div>
									<div className='relative flex justify-center text-xs uppercase'>
										<span className='bg-card px-2 text-muted-foreground'>
											Or continue with
										</span>
									</div>
								</div>

								<Button
									type='button'
									variant='outline'
									className='w-full'
									onClick={handlePasskeySignIn}
									disabled={passkeyLoading || loading}
								>
									{passkeyLoading ? (
										<>
											<div
												className='mr-2 w-4 h-4 rounded-full border-b-2 border-current animate-spin'
												role='status'
											/>
											Signing in with passkey...
										</>
									) : (
										<>
											<Key className='mr-2 h-4 w-4' />
											Sign in with Passkey
										</>
									)}
								</Button>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
