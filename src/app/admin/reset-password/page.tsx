'use client';

import { useState } from 'react';
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
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess(true);
				setEmail('');
			} else {
				setError(data.error || data.message || 'Failed to send reset email. Please try again.');
			}
		} catch (error) {
			console.error('Password reset error:', error);
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'>
			<div className='w-full max-w-md'>
				<Card className='shadow-xl'>
					<CardHeader className='pb-6 text-center'>
						<CardTitle className='text-2xl'>
							Reset Your Password
						</CardTitle>
						<CardDescription>
							Enter your email address and we'll send you a link to reset your password
						</CardDescription>
					</CardHeader>
					<CardContent>
						{success ? (
							<div className='space-y-4'>
								<Alert className='border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'>
									<CheckCircle className='h-4 w-4' />
									<AlertDescription>
										If an account with that email exists, we've sent a password reset link.
										Please check your email and click the link to reset your password.
									</AlertDescription>
								</Alert>
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
						) : (
							<form onSubmit={handleSubmit} className='space-y-4'>
								{error && (
									<Alert variant='destructive'>
										<AlertCircle className='h-4 w-4' />
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className='space-y-2'>
									<Label htmlFor='email'>Email Address</Label>
									<Input
										id='email'
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder='Enter your email'
										required
										autoComplete='email'
										disabled={loading}
									/>
								</div>

								<Button
									type='submit'
									className='w-full'
									disabled={loading || !email}
								>
									{loading ? (
										<>
											<div className='mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin' />
											Sending...
										</>
									) : (
										'Send Reset Link'
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
