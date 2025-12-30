'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/loading';
import { useLoading } from '@/hooks/use-loading';
import { PrayerRequestForm } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PrayerRequestsClientProps {
	enabled: boolean;
	siteContent?: Record<string, string>;
}

export default function PrayerRequestsClient({
	enabled,
	siteContent = {},
}: PrayerRequestsClientProps) {
	// Use nullish coalescing to check if key exists, not just if value is truthy
	const pageTitle = siteContent['prayer-requests.title'] !== undefined ? siteContent['prayer-requests.title'] : 'Prayer Requests';
	const pageDescription = siteContent['prayer-requests.description'] !== undefined ? siteContent['prayer-requests.description'] : "Share your prayer needs, and Kylee will lift them up before God.";
	const formTitle = siteContent['prayer-requests.form.title'] !== undefined ? siteContent['prayer-requests.form.title'] : 'Submit a Prayer Request';
	const formDescription = siteContent['prayer-requests.form.description'] !== undefined ? siteContent['prayer-requests.form.description'] : 'Your prayer request will be kept confidential and prayed over with care.';
	const aboutTitle = siteContent['prayer-requests.about.title'] !== undefined ? siteContent['prayer-requests.about.title'] : 'About Prayer Requests';
	const aboutContent = siteContent['prayer-requests.about.content'] !== undefined ? siteContent['prayer-requests.about.content'] : "Kylee believes in the power of prayer and is honored to lift up your needs before God. All prayer requests are treated with the utmost confidentiality and respect. Whether you're facing challenges, celebrating joys, or seeking guidance, know that your request will be prayed over with love and care.";
	const [formData, setFormData] = useState<PrayerRequestForm>({
		name: '',
		email: '',
		request: '',
		isPrivate: true,
	});
	const { isLoading, withLoading } = useLoading();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	if (!enabled) {
		return (
			<div className='container px-4 py-8 mx-auto max-w-2xl'>
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>
						Prayer requests are currently disabled. Please check back later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (!formData.request.trim()) {
			setError('Please enter your prayer request');
			return;
		}

		await withLoading(async () => {
			try {
				const response = await fetch('/api/prayer-requests', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: formData.name || null,
						email: formData.email || null,
						request: formData.request,
						isPrivate: formData.isPrivate,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					setSuccess(true);
					setFormData({
						name: '',
						email: '',
						request: '',
						isPrivate: true,
					});
				} else {
					setError(data.error || 'Failed to submit prayer request. Please try again.');
				}
			} catch {
				setError('Error submitting prayer request. Please try again.');
			}
		});
	};

	return (
		<div className='container px-4 py-8 mx-auto max-w-2xl'>
			<div className='mb-12 text-center'>
				<h1 className='mb-4 text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r md:text-4xl from-primary to-primary/60 pb-1'>
					{pageTitle}
				</h1>
				<p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
					{pageDescription}
				</p>
			</div>

			{error && (
				<Alert variant='destructive' className='mb-6'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className='mb-6 border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'>
					<AlertDescription>
						Thank you for your prayer request! 🙏 Kylee will pray for you.
					</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Submit a Prayer Request</CardTitle>
					<CardDescription>
						Your prayer request will be kept confidential and prayed over
						with care.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Name (Optional)</Label>
								<Input
									id='name'
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder='Your name'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email (Optional)</Label>
								<Input
									id='email'
									type='email'
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder='your.email@example.com'
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='request'>
								Prayer Request *
							</Label>
							<Textarea
								id='request'
								value={formData.request}
								onChange={(e) =>
									setFormData({ ...formData, request: e.target.value })
								}
								placeholder='Please share your prayer request...'
								rows={6}
								required
								maxLength={2000}
							/>
							<p className='text-sm text-muted-foreground'>
								{formData.request.length}/2000 characters
							</p>
						</div>

						<div className='space-y-2'>
							<div className='flex gap-2 items-center'>
								<input
									type='checkbox'
									id='isPrivate'
									checked={formData.isPrivate}
									onChange={(e) =>
										setFormData({
											...formData,
											isPrivate: e.target.checked,
										})
									}
								/>
								<Label htmlFor='isPrivate'>
									Keep this prayer request private (recommended)
								</Label>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={isLoading}
						>
							{isLoading ? (
								<span className='flex gap-2 items-center'>
									<Loading size='sm' />
									Submitting...
								</span>
							) : (
								'Submit Prayer Request'
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card className='mt-8'>
				<CardContent className='py-6'>
					<h3 className='mb-2 font-semibold'>{aboutTitle}</h3>
					<p className='text-sm text-muted-foreground'>
						{aboutContent}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
