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
import { Loading } from '@/components/loading';
import { useLoading } from '@/hooks/use-loading';
import { PrayerRequestForm } from '@/types';

export default function PrayerRequestsPage() {
	const [formData, setFormData] =
		useState<PrayerRequestForm>({
			name: '',
			email: '',
			request: '',
			isPrivate: true,
		});
	const { isLoading, withLoading } = useLoading();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.request.trim()) {
			alert('Please enter your prayer request');
			return;
		}

		await withLoading(async () => {
			try {
				const response = await fetch(
					'/api/prayer-requests',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							name: formData.name || null,
							email: formData.email || null,
							request: formData.request,
							isPrivate: formData.isPrivate,
						}),
					}
				);

				if (response.ok) {
					alert(
						'Thank you for your prayer request! 🙏 Kylee will pray for you.'
					);
					setFormData({
						name: '',
						email: '',
						request: '',
						isPrivate: true,
					});
				} else {
					alert(
						'Failed to submit prayer request. Please try again.'
					);
				}
			} catch {
				alert('Error submitting prayer request');
			}
		});
	};

	return (
		<div className='container px-4 py-8 mx-auto max-w-2xl'>
			<div className='mb-8 text-center'>
				<h1 className='mb-4 text-4xl font-bold'>
					Prayer Requests
				</h1>
				<p className='text-xl text-muted-foreground'>
					Share your prayer needs with Kylee. Your requests
					will be kept private and prayed over with love and
					care.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Submit a Prayer Request</CardTitle>
					<CardDescription>
						All prayer requests are private and will only be
						seen by Kylee. You can choose to remain
						anonymous or provide your contact information.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={handleSubmit}
						className='space-y-6'
					>
						<div className='space-y-2'>
							<Label htmlFor='name'>
								Your Name (Optional)
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								placeholder='Enter your name (optional)'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='email'>
								Email (Optional)
							</Label>
							<Input
								id='email'
								type='email'
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								placeholder='Enter your email (optional)'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='request'>
								Prayer Request *
							</Label>
							<Textarea
								id='request'
								value={formData.request}
								onChange={(e) =>
									setFormData({
										...formData,
										request: e.target.value,
									})
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
									Keep this prayer request private
									(recommended)
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
					<h3 className='mb-2 font-semibold'>
						About Prayer Requests
					</h3>
					<p className='text-sm text-muted-foreground'>
						Kylee believes in the power of prayer and is
						honored to lift up your needs before God. All
						prayer requests are treated with the utmost
						confidentiality and respect. Whether you're
						facing challenges, celebrating joys, or seeking
						guidance, know that your request will be prayed
						over with love and care.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
