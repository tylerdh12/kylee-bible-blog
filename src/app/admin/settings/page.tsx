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
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
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

	const handleSave = async () => {
		setSaving(true);
		try {
			// TODO: Implement settings save API
			await new Promise((resolve) =>
				setTimeout(resolve, 1000)
			); // Simulate API call
			console.log('Settings saved:', settings);
		} catch (error) {
			console.error('Error saving settings:', error);
		} finally {
			setSaving(false);
		}
	};

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
							<Label htmlFor='siteName'>Site Name</Label>
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
							/>
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
							<div className='flex items-center space-x-2'>
								<input
									type='checkbox'
									id='maintenanceMode'
									checked={settings.maintenanceMode}
									onChange={(e) =>
										setSettings({
											...settings,
											maintenanceMode: e.target.checked,
										})
									}
									className='rounded'
								/>
								<Label
									htmlFor='maintenanceMode'
									className='text-sm'
								>
									Enable maintenance mode
								</Label>
							</div>
							<p className='text-xs text-muted-foreground'>
								When enabled, visitors will see a
								maintenance page
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
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<div className='flex items-center space-x-2'>
								<input
									type='checkbox'
									id='allowComments'
									checked={settings.allowComments}
									onChange={(e) =>
										setSettings({
											...settings,
											allowComments: e.target.checked,
										})
									}
									className='rounded'
								/>
								<Label
									htmlFor='allowComments'
									className='text-sm'
								>
									Allow Comments
								</Label>
							</div>
							<p className='text-xs text-muted-foreground'>
								Let visitors comment on your posts
							</p>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center space-x-2'>
								<input
									type='checkbox'
									id='allowPrayerRequests'
									checked={settings.allowPrayerRequests}
									onChange={(e) =>
										setSettings({
											...settings,
											allowPrayerRequests: e.target.checked,
										})
									}
									className='rounded'
								/>
								<Label
									htmlFor='allowPrayerRequests'
									className='text-sm'
								>
									Allow Prayer Requests
								</Label>
							</div>
							<p className='text-xs text-muted-foreground'>
								Let visitors submit prayer requests
							</p>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center space-x-2'>
								<input
									type='checkbox'
									id='allowDonations'
									checked={settings.allowDonations}
									onChange={(e) =>
										setSettings({
											...settings,
											allowDonations: e.target.checked,
										})
									}
									className='rounded'
								/>
								<Label
									htmlFor='allowDonations'
									className='text-sm'
								>
									Allow Donations
								</Label>
							</div>
							<p className='text-xs text-muted-foreground'>
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
