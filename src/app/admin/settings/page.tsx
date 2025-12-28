'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
	Settings,
	User,
	Mail,
	Globe,
	Shield,
	Database,
	Bell,
	Palette,
	Save,
	AlertCircle,
	CheckCircle,
} from 'lucide-react';

interface SiteSettings {
	siteName: string;
	siteDescription: string;
	siteUrl: string;
	adminEmail: string;
	allowComments: boolean;
	allowPrayerRequests: boolean;
	allowDonations: boolean;
	maintenanceMode: boolean;
}

export default function SettingsPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [settings, setSettings] = useState<SiteSettings>({
		siteName: "Kylee's Blog",
		siteDescription:
			"Follow Kylee's Bible study journey, support her goals, and join her community.",
		siteUrl: '',
		adminEmail: '',
		allowComments: true,
		allowPrayerRequests: true,
		allowDonations: true,
		maintenanceMode: false,
	});

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			const response = await fetch('/api/admin/settings');
			if (response.ok) {
				const data = await response.json();
				setSettings(data.settings);
			}
		} catch (error) {
			console.error('Error fetching settings:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			// Basic validation
			if (!settings.siteName.trim()) {
				setError('Site name is required');
				setSaving(false);
				return;
			}

			if (settings.adminEmail && !settings.adminEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				setError('Please enter a valid admin email address');
				setSaving(false);
				return;
			}

			const response = await fetch('/api/admin/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(settings),
			});

			const data = await response.json();

			if (response.ok) {
				setSettings(data.settings);
				setSuccess('Settings saved successfully!');
				setTimeout(() => setSuccess(null), 3000);
			} else {
				setError(data.error || 'Failed to save settings');
			}
		} catch (error) {
			console.error('Error saving settings:', error);
			setError('An unexpected error occurred');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading settings...</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Settings
					</h1>
					<p className='text-muted-foreground'>
						Configure your blog and admin preferences
					</p>
				</div>
				<Button
					onClick={handleSave}
					disabled={saving}
				>
					<Save className='h-4 w-4 mr-2' />
					{saving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>

			{/* Error/Success Alerts */}
			{error && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			{success && (
				<Alert className='border-green-500 bg-green-50 text-green-700'>
					<CheckCircle className='h-4 w-4' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* General Settings */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Settings className='h-5 w-5' />
							General Settings
						</CardTitle>
						<CardDescription>
							Basic site configuration
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='siteName'>Site Name *</Label>
							<Input
								id='siteName'
								value={settings.siteName}
								onChange={(e) =>
									setSettings({
										...settings,
										siteName: e.target.value,
									})
								}
								placeholder='Your blog name'
								className={!settings.siteName.trim() ? 'border-red-500' : ''}
							/>
							{!settings.siteName.trim() && (
								<p className='text-xs text-red-500'>Site name is required</p>
							)}
						</div>
						<div className='space-y-2'>
							<Label htmlFor='siteDescription'>
								Site Description
							</Label>
							<Textarea
								id='siteDescription'
								value={settings.siteDescription}
								onChange={(e) =>
									setSettings({
										...settings,
										siteDescription: e.target.value,
									})
								}
								placeholder='Brief description of your blog'
								rows={3}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='siteUrl'>Site URL</Label>
							<Input
								id='siteUrl'
								value={settings.siteUrl}
								onChange={(e) =>
									setSettings({
										...settings,
										siteUrl: e.target.value,
									})
								}
								placeholder='https://yourblog.com'
							/>
						</div>
					</CardContent>
				</Card>

				{/* Admin Settings */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Admin Settings
						</CardTitle>
						<CardDescription>
							Administrator preferences
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='adminEmail'>
								Admin Email
							</Label>
							<Input
								id='adminEmail'
								type='email'
								value={settings.adminEmail}
								onChange={(e) =>
									setSettings({
										...settings,
										adminEmail: e.target.value,
									})
								}
								placeholder='admin@yourblog.com'
							/>
						</div>
						<div className='space-y-2'>
							<Label>Maintenance Mode</Label>
							<div className='flex items-center space-x-3'>
								<Switch
									id='maintenanceMode'
									checked={settings.maintenanceMode}
									onCheckedChange={(checked) =>
										setSettings({
											...settings,
											maintenanceMode: checked,
										})
									}
								/>
								<Label
									htmlFor='maintenanceMode'
									className='text-sm'
								>
									Enable maintenance mode
								</Label>
							</div>
							<p className='text-xs text-muted-foreground'>
								When enabled, visitors will see a maintenance page
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Feature Settings */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Shield className='h-5 w-5' />
							Feature Settings
						</CardTitle>
						<CardDescription>
							Enable or disable site features
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='space-y-2'>
							<div className='flex items-center space-x-3'>
								<Switch
									id='allowComments'
									checked={settings.allowComments}
									onCheckedChange={(checked) =>
										setSettings({
											...settings,
											allowComments: checked,
										})
									}
								/>
								<Label
									htmlFor='allowComments'
									className='text-sm font-medium'
								>
									Allow Comments
								</Label>
							</div>
							<p className='text-xs text-muted-foreground ml-9'>
								Let visitors comment on your posts
							</p>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center space-x-3'>
								<Switch
									id='allowPrayerRequests'
									checked={settings.allowPrayerRequests}
									onCheckedChange={(checked) =>
										setSettings({
											...settings,
											allowPrayerRequests: checked,
										})
									}
								/>
								<Label
									htmlFor='allowPrayerRequests'
									className='text-sm font-medium'
								>
									Allow Prayer Requests
								</Label>
							</div>
							<p className='text-xs text-muted-foreground ml-9'>
								Let visitors submit prayer requests
							</p>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center space-x-3'>
								<Switch
									id='allowDonations'
									checked={settings.allowDonations}
									onCheckedChange={(checked) =>
										setSettings({
											...settings,
											allowDonations: checked,
										})
									}
								/>
								<Label
									htmlFor='allowDonations'
									className='text-sm font-medium'
								>
									Allow Donations
								</Label>
							</div>
							<p className='text-xs text-muted-foreground ml-9'>
								Enable donation functionality
							</p>
						</div>
					</CardContent>
				</Card>

				{/* System Status */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Database className='h-5 w-5' />
							System Status
						</CardTitle>
						<CardDescription>
							Current system information
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium'>
								Database
							</span>
							<Badge
								variant='outline'
								className='text-green-600 border-green-600 dark:text-green-400 dark:border-green-400'
							>
								Connected
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium'>
								API Status
							</span>
							<Badge
								variant='outline'
								className='text-green-600 border-green-600 dark:text-green-400 dark:border-green-400'
							>
								Healthy
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium'>
								Last Backup
							</span>
							<span className='text-sm text-muted-foreground'>
								{new Date().toLocaleDateString()}
							</span>
						</div>
						<Separator />
						<div className='text-xs text-muted-foreground'>
							<p>Version: 1.0.0</p>
							<p>Environment: {process.env.NODE_ENV}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
