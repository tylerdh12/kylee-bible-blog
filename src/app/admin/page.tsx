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
	Key,
} from 'lucide-react';
import { authClient } from '@/lib/better-auth-client';
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
	const [isLoggedIn, setIsLoggedIn] = useState<
		boolean | null
	>(null);
	const [user, setUser] = useState<User | null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
	const [stats, setStats] = useState<DashboardStats | null>(
		null
	);
	const [statsLoading, setStatsLoading] = useState(true);

	useEffect(() => {
		checkAuthStatus();
		// Check passkey support after component mounts (client-side only)
		if (typeof window !== 'undefined') {
			setPasskeySupported(typeof window.PublicKeyCredential !== 'undefined');
		}
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

			if (data.authenticated && data.user) {
				// Only allow ADMIN users to access admin pages
				if (data.user.role !== 'ADMIN') {
					setIsLoggedIn(false);
					setUser(null);
					// Redirect non-admin users away
					window.location.href = '/';
					return;
				}
				setIsLoggedIn(true);
				setUser(data.user);
			} else {
				setIsLoggedIn(false);
				setUser(null);
			}
		} catch {
			setIsLoggedIn(false);
			setUser(null);
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
			// Use better-auth signIn endpoint
			const response = await fetch('/api/auth/sign-in/email', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			let responseData: any = {};
			let responseText = '';
			try {
				responseText = await response.text();
				console.log('Raw response text:', responseText);
				console.log('Response status:', response.status);
				console.log('Response headers:', Object.fromEntries(response.headers.entries()));
				
				if (responseText) {
					try {
						responseData = JSON.parse(responseText);
					} catch (parseError) {
						console.error('Failed to parse JSON:', parseError);
						console.error('Response text was:', responseText);
						responseData = { error: 'Invalid server response', raw: responseText };
					}
				} else {
					console.warn('Empty response body');
					responseData = { error: 'Empty server response' };
				}
			} catch (readError) {
				console.error('Failed to read response:', readError);
				responseData = { error: 'Failed to read server response' };
			}

			if (response.ok && !responseData.error) {
				// Sign-in successful - better-auth should have set the session cookie
				// The response might contain user data, or we need to check auth status
				console.log('Sign-in response data:', responseData);
				
				// Wait a moment for the cookie to be set, then check auth status
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Check auth status to get user data with role
				let statusCheckAttempts = 0;
				const maxAttempts = 5; // Increased retries
				let userData = null;
				let lastError = null;
				
				while (statusCheckAttempts < maxAttempts && !userData) {
					try {
						const statusResponse = await fetch('/api/auth/status', {
							method: 'GET',
							credentials: 'include',
							cache: 'no-store',
							headers: {
								'Content-Type': 'application/json',
							},
						});

						console.log(`Auth status check attempt ${statusCheckAttempts + 1}:`, statusResponse.status);

						if (statusResponse.ok) {
							const data = await statusResponse.json();
							console.log('Auth status data:', data);
							if (data.authenticated && data.user) {
								userData = data.user;
								break;
							} else {
								lastError = 'Not authenticated in status check';
							}
						} else {
							const errorData = await statusResponse.json().catch(() => ({}));
							lastError = `Status check failed: ${statusResponse.status} - ${JSON.stringify(errorData)}`;
							console.error('Auth status check failed:', lastError);
						}
					} catch (statusError) {
						lastError = `Status check error: ${statusError}`;
						console.error('Auth status check error:', statusError);
					}
					
					statusCheckAttempts++;
					if (statusCheckAttempts < maxAttempts) {
						// Wait longer between retries
						await new Promise(resolve => setTimeout(resolve, 500));
					}
				}

				if (userData) {
					// Verify user is ADMIN before allowing access
					if (userData.role !== 'ADMIN') {
						alert('Access denied. Admin privileges required.');
						setIsLoggedIn(false);
						setUser(null);
						window.location.href = '/';
						return;
					}
					
					// Update local state
					setIsLoggedIn(true);
					setUser(userData);
					setEmail('');
					setPassword('');

					// Dispatch custom event to notify layout of authentication change
					window.dispatchEvent(new CustomEvent('auth-changed', {
						detail: { authenticated: true, user: userData }
					}));
					
					// Navigate to admin dashboard instead of reloading
					// This allows the layout to properly handle the authenticated state
					window.location.href = '/admin';
				} else {
					// If status check still fails after retries, show error
					console.error('Login succeeded but auth status check failed:', lastError);
					alert(`Login successful but session verification failed. Please try refreshing the page. Error: ${lastError}`);
					// Try a page reload to let the browser properly set cookies and let layout handle auth
					window.location.reload();
				}
			} else {
				// Better error handling
				console.error('Login failed - Response status:', response.status);
				console.error('Login failed - Response data:', responseData);
				
				// Handle specific error cases
				let errorMessage = 'Invalid credentials. Please check your email and password.';
				
				if (response.status === 403) {
					// Access denied - likely a subscriber trying to log in
					errorMessage = responseData.error?.message || 
						responseData.message || 
						'Access denied. Subscribers cannot log in. Please contact an administrator.';
				} else if (response.status === 401) {
					errorMessage = responseData.error?.message || 
						responseData.message || 
						responseData.error ||
						'Invalid credentials. Please check your email and password.';
				} else {
					errorMessage = responseData.error?.message || 
						responseData.message || 
						responseData.error ||
						'Login failed. Please try again.';
				}
				
				alert(errorMessage);
			}
		} catch (error) {
			console.error('Login error:', error);
			alert('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Handle passkey sign-in
	const handlePasskeySignIn = async () => {
		setPasskeyLoading(true);
		
		try {
			// Check if passkeys are supported
			if (typeof window === 'undefined' || typeof window.PublicKeyCredential === 'undefined') {
				alert('Passkeys are not supported in this browser. Please use a modern browser that supports WebAuthn.');
				setPasskeyLoading(false);
				return;
			}

			// Check if passkey methods are available
			// The correct method is authClient.signIn.passkey (not authClient.passkey.signIn)
			const passkeySignIn = (authClient.signIn as any)?.passkey;
			if (!passkeySignIn || typeof passkeySignIn !== 'function') {
				alert('Passkey sign-in is not available. Please ensure the passkey plugin is properly configured.');
				setPasskeyLoading(false);
				return;
			}

			// Sign in with passkey
			console.log('[Passkey] Starting passkey sign-in...');
			console.log('[Passkey] authClient.signIn.passkey available:', typeof passkeySignIn);
			
			console.log('[Passkey] Calling authClient.signIn.passkey...');
			console.log('[Passkey] Browser WebAuthn support:', {
				PublicKeyCredential: typeof window.PublicKeyCredential !== 'undefined',
				credentials: typeof navigator.credentials !== 'undefined',
			});
			
			// Track if authentication completed
			let authCompleted = false;
			let authResolve: ((value: any) => void) | null = null;
			let authReject: ((error: any) => void) | null = null;
			
			// Create a promise that will be resolved/rejected by the callbacks
			const authCompletionPromise = new Promise((resolve, reject) => {
				authResolve = resolve;
				authReject = reject;
			});
			
			// Add a timeout to prevent hanging indefinitely
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => {
					if (!authCompleted) {
						console.error('[Passkey] Sign-in timed out after 60 seconds');
						reject(new Error('Passkey sign-in timed out. The browser prompt may not have appeared, or you may need to interact with it. Please try again or use email/password login.'));
					}
				}, 60000); // Increased to 60 seconds to allow time for user interaction
			});
			
			console.log('[Passkey] About to call passkeySignIn...');
			const passkeyPromise = passkeySignIn({
				autoFill: false, // Disable autofill - let browser show prompt explicitly
				fetchOptions: {
					onSuccess: async (context: any) => {
						authCompleted = true;
						console.log('[Passkey] Sign-in successful:', context);
						
						// Wait a moment for the session cookie to be set
						await new Promise(resolve => setTimeout(resolve, 500));
						
						// Check auth status to get user data with role
						const statusResponse = await fetch('/api/auth/status', {
							method: 'GET',
							credentials: 'include',
							cache: 'no-store',
							headers: {
								'Content-Type': 'application/json',
							},
						});

						if (statusResponse.ok) {
							const statusData = await statusResponse.json();
							if (statusData.authenticated && statusData.user) {
								// Verify user is ADMIN before allowing access
								if (statusData.user.role !== 'ADMIN') {
									alert('Access denied. Admin privileges required.');
									setIsLoggedIn(false);
									setUser(null);
									window.location.href = '/';
									if (authReject) authReject(new Error('Access denied'));
									return;
								}
								
								setIsLoggedIn(true);
								setUser(statusData.user);
								
								// Dispatch custom event to notify layout of authentication change
								window.dispatchEvent(new CustomEvent('auth-changed', {
									detail: { authenticated: true, user: statusData.user }
								}));
								
								// Resolve the promise
								if (authResolve) authResolve(context);
								
								// Reload to show the dashboard
								window.location.reload();
							} else {
								if (authReject) authReject(new Error('Authentication failed'));
							}
						} else {
							if (authReject) authReject(new Error('Failed to verify authentication status'));
						}
					},
					onError: (context: any) => {
						authCompleted = true;
						console.error('[Passkey] Sign-in error:', context);
						const error = context.error;
						
						let errorMessage = 'Passkey sign-in failed. Please try again.';
						let isUserCancellation = false;
						
						if (error) {
							const errorCode = ('code' in error ? error.code : '') || ('name' in error ? error.name : '') || '';
							const errorMsg = ((error.message || '') as string).toLowerCase();
							
							if (
								errorCode === 'NotAllowedError' || 
								errorCode === 'AbortError' ||
								errorMsg.includes('cancel') || 
								errorMsg.includes('notallowed') ||
								errorMsg.includes('abort')
							) {
								errorMessage = 'Passkey authentication was cancelled.';
								isUserCancellation = true;
							} else if (errorCode === 'NotSupportedError' || errorMsg.includes('not supported')) {
								errorMessage = 'Passkey authentication is not supported on this device. Please use email/password login.';
							} else if (errorCode === 'InvalidStateError' || errorMsg.includes('invalidstate') || errorMsg.includes('no passkey')) {
								errorMessage = 'No passkey found for this account. Please register a passkey first from your profile page (/admin/profile).';
							} else if (error.message) {
								errorMessage = error.message;
							}
						}
						
						if (!isUserCancellation) {
							alert(errorMessage);
						}
						
						// Reject the promise
						const finalError = error || new Error(errorMessage);
						if (authReject) authReject(finalError);
					},
				},
			});

			// Also listen to the passkeyPromise directly to catch any immediate errors
			if (passkeyPromise && typeof passkeyPromise.catch === 'function') {
				passkeyPromise.catch((error: any) => {
					console.error('[Passkey] passkeyPromise rejected:', error);
					if (!authCompleted && authReject) {
						authCompleted = true;
						authReject(error);
					}
				});
			}

			// Race between passkey sign-in completion and timeout
			console.log('[Passkey] Waiting for passkey sign-in response...');
			try {
				// Wait for either the auth completion promise or the timeout
				// Don't include passkeyPromise in the race - it might not resolve when using fetchOptions
				const result = await Promise.race([authCompletionPromise, timeoutPromise]) as any;
				console.log('[Passkey] Sign-in promise resolved:', result);

				// Handle result if it's returned synchronously
				if (result?.error) {
					const error = result.error;
					let errorMessage = 'Passkey sign-in failed. Please try again.';
					let isUserCancellation = false;
					
					// Handle specific error types
					const errorCode = ('code' in error ? error.code : '') || '';
					const errorMsg = (error.message || '').toLowerCase();
					
					if (errorCode === 'NotAllowedError' || errorCode === 'AbortError' || errorMsg.includes('cancel') || errorMsg.includes('abort')) {
						errorMessage = 'Passkey authentication was cancelled.';
						isUserCancellation = true;
					} else if (error.message) {
						errorMessage = error.message;
					}
					
					// Only alert if not cancelled (user knows they cancelled)
					if (!isUserCancellation) {
						alert(errorMessage);
					} else {
						console.log('[Passkey] User cancelled authentication');
					}
				}
			} catch (timeoutError: any) {
				// Handle timeout or other errors
				console.error('[Passkey] Sign-in error:', timeoutError);
				if (timeoutError?.message?.includes('timed out')) {
					alert('Passkey sign-in timed out. The browser prompt may not have appeared. Please try again or use email/password login.');
				} else {
					alert(timeoutError?.message || 'Passkey sign-in failed. Please try again.');
				}
			}
		} catch (error: any) {
			console.error('Passkey sign-in error:', error);
			
			// Handle specific error types
			let errorMessage = 'Passkey sign-in failed. Please try again.';
			if (error?.name === 'NotAllowedError' || error?.message?.includes('cancel')) {
				errorMessage = 'Passkey authentication was cancelled.';
			} else if (error?.message) {
				errorMessage = error.message;
			}
			
			// Only alert if not cancelled
			if (!errorMessage.includes('cancelled')) {
				alert(errorMessage);
			}
		} finally {
			setPasskeyLoading(false);
		}
	};

	// Check if passkeys are supported (use state to avoid SSR issues)
	const isPasskeySupported = () => {
		return passkeySupported === true;
	};

	// Show loading while checking auth status
	if (isLoggedIn === null) {
		return <DashboardStatsSkeleton />;
	}

	// If logged in, show dashboard content (layout will handle the wrapper)
	if (isLoggedIn && user) {
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
							<div className='flex items-center justify-between'>
								<Link
									href='/admin/reset-password'
									className='text-sm text-primary hover:underline'
								>
									Forgot password?
								</Link>
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
									aria-label='Sign in with passkey'
								>
									{passkeyLoading ? (
										<>
											<div
												className='mr-2 w-4 h-4 rounded-full border-b-2 border-current animate-spin'
												role='status'
												aria-hidden='true'
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
