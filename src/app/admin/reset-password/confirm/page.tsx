'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function ConfirmResetPasswordForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get('token');

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [invalidToken, setInvalidToken] = useState(false);

	useEffect(() => {
		if (!token) {
			setInvalidToken(true);
		}
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validation
		if (!password || password.length < 8) {
			setError('Password must be at least 8 characters long');
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					newPassword: password,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess(true);
				setPassword('');
				setConfirmPassword('');
				// Redirect to login after 3 seconds
				setTimeout(() => {
					router.push('/admin');
				}, 3000);
			} else {
				setError(data.error || data.message || 'Failed to reset password. The link may have expired.');
			}
		} catch (error) {
			console.error('Password reset error:', error);
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (invalidToken) {
		return (
			<div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'>
				<div className='w-full max-w-md'>
					<Card className='shadow-xl'>
						<CardHeader className='pb-6 text-center'>
							<CardTitle className='text-2xl'>
								Invalid Reset Link
							</CardTitle>
							<CardDescription>
								This password reset link is invalid or has expired.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Alert variant='destructive'>
								<AlertCircle className='h-4 w-4' />
								<AlertDescription>
									Please request a new password reset link.
								</AlertDescription>
							</Alert>
							<div className='mt-4 space-y-2'>
								<Button
									asChild
									className='w-full'
								>
									<Link href='/admin/reset-password'>
										Request New Reset Link
									</Link>
								</Button>
								<Button
									asChild
									variant='outline'
									className='w-full'
								>
									<Link href='/admin'>
										<ArrowLeft className='mr-2 h-4 w-4' />
										Back to Login
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'>
			<div className='w-full max-w-md'>
				<Card className='shadow-xl'>
					<CardHeader className='pb-6 text-center'>
						<CardTitle className='text-2xl'>
							Set New Password
						</CardTitle>
						<CardDescription>
							Enter your new password below
						</CardDescription>
					</CardHeader>
					<CardContent>
						{success ? (
							<div className='space-y-4'>
								<Alert className='border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'>
									<CheckCircle className='h-4 w-4' />
									<AlertDescription>
										Your password has been reset successfully! Redirecting to login...
									</AlertDescription>
								</Alert>
								<Button
									asChild
									className='w-full'
								>
									<Link href='/admin'>
										Go to Login
									</Link>
								</Button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className='space-y-4'>
								{error && (
									<Alert variant='destructive'>
										<AlertCircle className='h-4 w-4' />
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className='space-y-2'>
									<Label htmlFor='password'>New Password</Label>
									<div className='relative'>
										<Input
											id='password'
											type={showPassword ? 'text' : 'password'}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											placeholder='Enter new password (min. 8 characters)'
											required
											minLength={8}
											autoComplete='new-password'
											disabled={loading}
											className='pr-10'
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
											tabIndex={-1}
										>
											{showPassword ? (
												<EyeOff className='h-4 w-4' />
											) : (
												<Eye className='h-4 w-4' />
											)}
										</button>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='confirmPassword'>Confirm New Password</Label>
									<div className='relative'>
										<Input
											id='confirmPassword'
											type={showConfirmPassword ? 'text' : 'password'}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder='Confirm new password'
											required
											minLength={8}
											autoComplete='new-password'
											disabled={loading}
											className='pr-10'
										/>
										<button
											type='button'
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
											tabIndex={-1}
										>
											{showConfirmPassword ? (
												<EyeOff className='h-4 w-4' />
											) : (
												<Eye className='h-4 w-4' />
											)}
										</button>
									</div>
								</div>

								<Button
									type='submit'
									className='w-full'
									disabled={loading || !password || !confirmPassword}
								>
									{loading ? (
										<>
											<div className='mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin' />
											Resetting Password...
										</>
									) : (
										'Reset Password'
									)}
								</Button>

								<div className='text-center'>
									<Link
										href='/admin'
										className='text-sm text-primary hover:underline'
									>
										<ArrowLeft className='inline mr-1 h-3 w-3' />
										Back to Login
									</Link>
								</div>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default function ConfirmResetPasswordPage() {
	return (
		<Suspense fallback={
			<div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4' />
					<p className='text-muted-foreground'>Loading...</p>
				</div>
			</div>
		}>
			<ConfirmResetPasswordForm />
		</Suspense>
	);
}
