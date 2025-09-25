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
import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardStats } from '@/components/dashboard-stats';
import { DashboardOverview } from '@/components/dashboard-overview';
import { User } from '@/types';

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
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading...
					</p>
				</div>
			</div>
		);
	}

	if (!isLoggedIn) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'>
				<div className='w-full max-w-md'>
					<Card className='shadow-xl'>
						<CardHeader className='text-center pb-6'>
							<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
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
									/>
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
									/>
								</div>
								<Button
									type='submit'
									className='w-full'
									disabled={loading}
								>
									{loading ? (
										<>
											<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
											Signing in...
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

	const uiUser = user
		? {
				name: user.name,
				email: user.email,
				avatar: undefined, // Add avatar logic if available
		  }
		: undefined;

	return (
		<DashboardLayout
			user={uiUser}
			breadcrumbs={[{ label: 'Dashboard' }]}
			title='Dashboard'
			description="Welcome back! Here's what's happening with your blog."
		>
			<div className='space-y-6'>
				{/* Stats Overview */}
				<DashboardStats />

				{/* Main Dashboard Content */}
				<DashboardOverview />

				{/* Quick Actions Footer */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Start</CardTitle>
						<CardDescription>
							Get started with these common tasks
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<Card className='p-4 hover:shadow-md transition-shadow cursor-pointer'>
								<a
									href='/admin/posts/new'
									className='block'
								>
									<div className='text-center space-y-2'>
										<div className='h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
											📝
										</div>
										<h4 className='font-medium'>
											Write Your First Post
										</h4>
										<p className='text-sm text-muted-foreground'>
											Share your thoughts and insights with
											your readers
										</p>
									</div>
								</a>
							</Card>

							<Card className='p-4 hover:shadow-md transition-shadow cursor-pointer'>
								<a
									href='/admin/goals'
									className='block'
								>
									<div className='text-center space-y-2'>
										<div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
											🎯
										</div>
										<h4 className='font-medium'>
											Set Up Goals
										</h4>
										<p className='text-sm text-muted-foreground'>
											Create fundraising goals for your
											ministry
										</p>
									</div>
								</a>
							</Card>

							<Card className='p-4 hover:shadow-md transition-shadow cursor-pointer'>
								<a
									href='/admin/donations'
									className='block'
								>
									<div className='text-center space-y-2'>
										<div className='h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto'>
											💝
										</div>
										<h4 className='font-medium'>
											Share Donation Page
										</h4>
										<p className='text-sm text-muted-foreground'>
											Let supporters contribute to your
											ministry
										</p>
									</div>
								</a>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
