'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function AdminPage() {
	const [isLoggedIn, setIsLoggedIn] = useState<
		boolean | null
	>(null);
	const [user, setUser] = useState<User | null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		checkAuthStatus();
	}, []);

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

	if (isLoggedIn === null) {
		return (
			<div
				className='flex items-center justify-center min-h-screen'
				role='main'
				aria-label='Loading admin dashboard'
			>
				<div className='text-center'>
					<div
						className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'
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

	if (!isLoggedIn) {
		return (
			<div
				className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'
				role='main'
			>
				<div className='w-full max-w-md'>
					<Card className='shadow-xl'>
						<CardHeader className='text-center pb-6'>
							<div
								className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'
								aria-hidden='true'
							>
								<div className='h-6 w-6 text-primary'>
									📝
								</div>
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
										onChange={(e) =>
											setEmail(e.target.value)
										}
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
												className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'
												role='status'
												aria-hidden='true'
											></div>
											Signing in...
											<span
												className='sr-only'
												id='login-status'
											>
												Processing your login request,
												please wait
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

	return (
		<DashboardLayout
			user={user}
			breadcrumbs={[{ label: 'Dashboard' }]}
			title='Admin Dashboard'
			description={`Welcome back, ${
				user?.name || 'Admin'
			}!`}
		>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Posts</CardTitle>
						<CardDescription>
							Manage your blog posts
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<p className='text-sm text-muted-foreground'>
								Create and manage your blog content
							</p>
							<Button
								asChild
								className='w-full'
							>
								<a href='/admin/posts'>View Posts</a>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Goals</CardTitle>
						<CardDescription>
							Manage ministry goals
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<p className='text-sm text-muted-foreground'>
								Set up fundraising goals
							</p>
							<Button
								asChild
								className='w-full'
							>
								<a href='/admin/goals'>View Goals</a>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Donations</CardTitle>
						<CardDescription>
							View donation history
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<p className='text-sm text-muted-foreground'>
								Track supporter contributions
							</p>
							<Button
								asChild
								className='w-full'
							>
								<a href='/admin/donations'>
									View Donations
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
