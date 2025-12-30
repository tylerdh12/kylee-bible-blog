'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscribeFormProps {
	variant?: 'default' | 'inline' | 'card';
	className?: string;
}

export function SubscribeForm({ variant = 'default', className = '' }: SubscribeFormProps) {
	const [email, setEmail] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setSuccess(false);

		try {
			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, name }),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess(true);
				setEmail('');
				setName('');
				toast.success(data.message || 'Successfully subscribed!');
			} else {
				toast.error(data.error || data.message || 'Failed to subscribe. Please try again.');
			}
		} catch (error) {
			toast.error('An error occurred. Please try again later.');
			if (process.env.NODE_ENV === 'development') {
				console.error('Subscription error:', error);
			}
		} finally {
			setLoading(false);
		}
	};

	if (variant === 'inline') {
		return (
			<form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
				<div className="flex-1">
					<Input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading || success}
						className="w-full"
					/>
				</div>
				<Button type="submit" disabled={loading || success} className="whitespace-nowrap">
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Subscribing...
						</>
					) : success ? (
						<>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							Subscribed!
						</>
					) : (
						<>
							<Mail className="mr-2 h-4 w-4" />
							Subscribe
						</>
					)}
				</Button>
			</form>
		);
	}

	if (variant === 'card') {
		return (
			<Card className={className}>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Mail className="h-5 w-5 text-primary" />
						<CardTitle>Stay Updated</CardTitle>
					</div>
					<CardDescription>
						Get notified when new posts are published. No spam, unsubscribe anytime.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{success ? (
						<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
							<CheckCircle2 className="h-5 w-5" />
							<p className="font-medium">Successfully subscribed!</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="subscribe-name">Name (optional)</Label>
								<Input
									id="subscribe-name"
									type="text"
									placeholder="Your name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="subscribe-email">Email</Label>
								<Input
									id="subscribe-email"
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={loading}
								/>
							</div>
							<Button type="submit" disabled={loading} className="w-full">
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Subscribing...
									</>
								) : (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Subscribe
									</>
								)}
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		);
	}

	// Default variant
	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center gap-2">
				<Mail className="h-5 w-5 text-primary" />
				<h3 className="text-lg font-semibold">Subscribe to New Posts</h3>
			</div>
			<p className="text-sm text-muted-foreground">
				Get email notifications when new blog posts are published. No spam, unsubscribe anytime.
			</p>
			{success ? (
				<div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
					<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
					<p className="text-green-800 dark:text-green-200 font-medium">
						Successfully subscribed! Check your email for confirmation.
					</p>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="subscribe-name">Name (optional)</Label>
						<Input
							id="subscribe-name"
							type="text"
							placeholder="Your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={loading}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="subscribe-email">Email</Label>
						<Input
							id="subscribe-email"
							type="email"
							placeholder="your@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</div>
					<Button type="submit" disabled={loading} className="w-full">
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Subscribing...
							</>
						) : (
							<>
								<Mail className="mr-2 h-4 w-4" />
								Subscribe
							</>
						)}
					</Button>
				</form>
			)}
		</div>
	);
}
