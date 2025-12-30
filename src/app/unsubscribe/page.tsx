'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribePage() {
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
	const [message, setMessage] = useState('');

	useEffect(() => {
		const id = searchParams.get('id');
		const email = searchParams.get('email');

		if (!id && !email) {
			setStatus('error');
			setMessage('Invalid unsubscribe link. Please contact support if you need help.');
			return;
		}

		// Automatically unsubscribe when page loads
		const unsubscribe = async () => {
			try {
				setStatus('loading');
				const response = await fetch('/api/unsubscribe?' + new URLSearchParams({ 
					...(id && { id }), 
					...(email && { email }) 
				}), {
					method: 'GET',
				});

				const data = await response.json();

				if (response.ok) {
					setStatus('success');
					setMessage(data.message || 'Successfully unsubscribed!');
				} else {
					setStatus('error');
					setMessage(data.error || 'Failed to unsubscribe. Please try again.');
				}
			} catch (error) {
				setStatus('error');
				setMessage('An error occurred. Please try again later.');
				if (process.env.NODE_ENV === 'development') {
					console.error('Unsubscribe error:', error);
				}
			}
		};

		unsubscribe();
	}, [searchParams]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						{status === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
						{status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
						{status === 'error' && <XCircle className="h-6 w-6 text-destructive" />}
						{status === 'idle' && <Mail className="h-6 w-6 text-muted-foreground" />}
					</div>
					<CardTitle>
						{status === 'loading' && 'Unsubscribing...'}
						{status === 'success' && 'Unsubscribed Successfully'}
						{status === 'error' && 'Unsubscribe Failed'}
						{status === 'idle' && 'Unsubscribe'}
					</CardTitle>
					<CardDescription>
						{status === 'loading' && 'Please wait while we process your request.'}
						{status === 'success' && 'You have been successfully unsubscribed.'}
						{status === 'error' && 'We encountered an error processing your request.'}
						{status === 'idle' && 'Processing your unsubscribe request...'}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{message && (
						<p className={`text-sm text-center ${
							status === 'success' ? 'text-green-600' : 
							status === 'error' ? 'text-destructive' : 
							'text-muted-foreground'
						}`}>
							{message}
						</p>
					)}

					{status === 'success' && (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground text-center">
								You will no longer receive email notifications about new posts.
							</p>
							<p className="text-sm text-muted-foreground text-center">
								You can resubscribe at any time by visiting our website.
							</p>
						</div>
					)}

					{status === 'error' && (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground text-center">
								If you continue to experience issues, please contact support.
							</p>
						</div>
					)}

					<div className="flex gap-2 pt-4">
						<Button asChild variant="outline" className="flex-1">
							<Link href="/">
								Go to Home
							</Link>
						</Button>
						{status === 'success' && (
							<Button asChild className="flex-1">
								<Link href="/subscribe">
									Resubscribe
								</Link>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
