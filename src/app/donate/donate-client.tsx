'use client';

import {
	useState,
	useEffect,
	useCallback,
} from 'react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/loading';
import { useLoading } from '@/hooks/use-loading';
import { useCurrency } from '@/hooks/use-currency';
import { AlertCircle } from 'lucide-react';

interface Goal {
	id: string;
	title: string;
	description?: string;
	currentAmount: number;
	targetAmount: number;
}

interface DonateClientProps {
	enabled: boolean;
	siteContent?: Record<string, string>;
}

export default function DonateClient({ enabled, siteContent = {} }: DonateClientProps) {
	// Use nullish coalescing to check if key exists, not just if value is truthy
	const pageTitle = siteContent['donate.title'] !== undefined ? siteContent['donate.title'] : "Support Kylee's Ministry";
	const pageDescription = siteContent['donate.description'] !== undefined ? siteContent['donate.description'] : "Your generosity helps further Bible study resources, ministry outreach, and spreading God's love in our community.";
	const formTitle = siteContent['donate.form.title'] !== undefined ? siteContent['donate.form.title'] : 'Make a Donation';
	const formDescription = siteContent['donate.form.description'] !== undefined ? siteContent['donate.form.description'] : 'Choose to support a specific goal or make a general donation to support the ministry.';
	const thankyouTitle = siteContent['donate.thankyou.title'] !== undefined ? siteContent['donate.thankyou.title'] : 'Thank You for Your Support!';
	const thankyouContent = siteContent['donate.thankyou.content'] !== undefined ? siteContent['donate.thankyou.content'] : "Your donation helps Kylee continue her Bible study ministry, create valuable content, and reach more people with God's word. Every contribution, no matter the size, makes a meaningful difference.";
	const [goals, setGoals] = useState<Goal[]>([]);
	const [selectedGoal, setSelectedGoal] = useState<string>('general');
	const [amount, setAmount] = useState('');
	const [donorName, setDonorName] = useState('');
	const [message, setMessage] = useState('');
	const [anonymous, setAnonymous] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const { isLoading: loading, withLoading } = useLoading();
	const {
		isLoading: goalsLoading,
		withLoading: withGoalsLoading,
	} = useLoading();
	const { formatAmount, currencyConfig } = useCurrency();

	const fetchGoals = useCallback(async () => {
		await withGoalsLoading(async () => {
			try {
				const response = await fetch('/api/goals');
				const data = await response.json();
				setGoals(data.goals || []);
			} catch (error) {
				console.error('Error fetching goals:', error);
			}
		});
	}, [withGoalsLoading]);

	useEffect(() => {
		if (enabled) {
			fetchGoals();
		}
	}, [enabled, fetchGoals]);

	const handleDonate = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (!amount || parseFloat(amount) <= 0) {
			setError('Please enter a valid donation amount');
			return;
		}

		await withLoading(async () => {
			try {
				const response = await fetch('/api/donations', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						amount: parseFloat(amount),
						donorName: anonymous ? null : donorName,
						message,
						anonymous,
						goalId:
							selectedGoal === 'general' ? null : selectedGoal,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					setSuccess(true);
					setAmount('');
					setDonorName('');
					setMessage('');
					setSelectedGoal('general');
				} else {
					setError(data.error || 'Failed to process donation. Please try again.');
				}
			} catch {
				setError('Error processing donation. Please try again.');
			}
		});
	};

	if (!enabled) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-2xl'>
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>
						Donations are currently disabled. Please check back later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const selectedGoalData =
		selectedGoal !== 'general'
			? goals.find((goal) => goal.id === selectedGoal)
			: null;

	return (
		<div className='container mx-auto px-4 py-8 max-w-2xl'>
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
						Thank you for your donation! 🙏
					</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>{formTitle}</CardTitle>
					<CardDescription>
						{formDescription}
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleDonate} className='space-y-6'>
						{goalsLoading ? (
							<div className='space-y-2'>
								<Label>
									Support a Specific Goal (Optional)
								</Label>
								<div className='h-10 bg-muted animate-pulse rounded-md'></div>
							</div>
						) : (
							goals.length > 0 && (
								<div className='space-y-2'>
									<Label>
										Support a Specific Goal (Optional)
									</Label>
									<Select
										value={selectedGoal}
										onValueChange={setSelectedGoal}
									>
										<SelectTrigger>
											<SelectValue placeholder='Choose a goal or leave blank for general donation' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='general'>
												General Donation
											</SelectItem>
											{goals.map((goal) => (
												<SelectItem
													key={goal.id}
													value={goal.id}
												>
													{goal.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{selectedGoalData && (
										<Card className='mt-4'>
											<CardContent className='pt-4'>
												<div className='flex justify-between items-center mb-2'>
													<h4 className='font-semibold'>
														{selectedGoalData.title}
													</h4>
													<Badge variant='outline'>
														{formatAmount(
															selectedGoalData.currentAmount
														)}{' '}
														/{' '}
														{formatAmount(
															selectedGoalData.targetAmount
														)}
													</Badge>
												</div>
												{selectedGoalData.description && (
													<p className='text-sm text-muted-foreground'>
														{selectedGoalData.description}
													</p>
												)}
												<div
													className='w-full bg-secondary rounded-full h-2 mt-3'
													role='progressbar'
													aria-label={`Goal progress: ${Math.min(
														(selectedGoalData.currentAmount /
															selectedGoalData.targetAmount) *
															100,
														100
													).toFixed(1)}% complete`}
													aria-valuenow={Math.min(
														(selectedGoalData.currentAmount /
															selectedGoalData.targetAmount) *
															100,
														100
													)}
													aria-valuemin={0}
													aria-valuemax={100}
												>
													<div
														className='bg-primary h-2 rounded-full'
														style={{
															width: `${Math.min(
																(selectedGoalData.currentAmount /
																	selectedGoalData.targetAmount) *
																	100,
																100
															)}%`,
														}}
													/>
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							)
						)}

						<div className='space-y-2'>
							<Label htmlFor='amount'>Donation Amount *</Label>
							<div className='relative'>
								<span
									className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
									aria-hidden='true'
								>
									{currencyConfig.symbol}
								</span>
								<Input
									id='amount'
									type='number'
									step='0.01'
									min='1'
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className='pl-7'
									placeholder='0.00'
									required
									aria-describedby='amount-help'
								/>
							</div>
							<p
								id='amount-help'
								className='text-sm text-muted-foreground'
							>
								Enter a donation amount in {currencyConfig.name}{' '}
								(minimum {formatAmount(1)})
							</p>
						</div>

						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='anonymous'
									checked={anonymous}
									onChange={(e) => setAnonymous(e.target.checked)}
								/>
								<Label htmlFor='anonymous'>
									Make this donation anonymous
								</Label>
							</div>
						</div>

						{!anonymous && (
							<div className='space-y-2'>
								<Label htmlFor='donorName'>
									Your Name (Optional)
								</Label>
								<Input
									id='donorName'
									value={donorName}
									onChange={(e) => setDonorName(e.target.value)}
									placeholder='Enter your name to be recognized'
								/>
							</div>
						)}

						<div className='space-y-2'>
							<Label htmlFor='message'>Message (Optional)</Label>
							<Textarea
								id='message'
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder='Leave an encouraging message...'
								rows={3}
							/>
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={loading}
							aria-describedby={
								loading ? 'donation-status' : undefined
							}
						>
							{loading ? (
								<span className='flex items-center gap-2'>
									<Loading size='sm' />
									Processing...
								</span>
							) : (
								`Donate ${formatAmount(parseFloat(amount) || 0)}`
							)}
							{loading && (
								<span className='sr-only' id='donation-status'>
									Processing your donation, please wait
								</span>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card className='mt-8'>
				<CardContent className='py-6'>
					<h3 className='font-semibold mb-2'>
						{thankyouTitle}
					</h3>
					<p className='text-sm text-muted-foreground'>
						{thankyouContent}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
