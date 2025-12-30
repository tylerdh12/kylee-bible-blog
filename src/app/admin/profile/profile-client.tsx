'use client';

import { useState } from 'react';
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
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	User,
	Mail,
	Calendar,
	Shield,
	Edit,
	Save,
	Camera,
	Lock,
	AlertCircle,
	CheckCircle,
	X,
	FileText,
	MessageSquare,
	Globe,
	Clock,
	UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
	id: string;
	name: string;
	email: string;
	role: string;
	avatar?: string;
	bio?: string;
	website?: string;
	createdAt: string;
	updatedAt: string;
	postsCount: number;
	commentsCount: number;
}

interface ProfileClientProps {
	initialProfile: UserProfile;
}

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState(false);
	const [profile, setProfile] = useState<UserProfile>(initialProfile);
	const [formData, setFormData] = useState({
		name: initialProfile.name || '',
		email: initialProfile.email || '',
		bio: initialProfile.bio || '',
		website: initialProfile.website || '',
	});
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [changingPassword, setChangingPassword] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			// Basic validation
			if (!formData.name.trim()) {
				setError('Name is required');
				setSaving(false);
				return;
			}

			if (!formData.email.trim()) {
				setError('Email is required');
				setSaving(false);
				return;
			}

			if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				setError('Please enter a valid email address');
				setSaving(false);
				return;
			}

			const response = await fetch('/api/admin/users/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				setProfile(data.user);
				setEditing(false);
				setSuccess('Profile updated successfully!');
				setTimeout(() => setSuccess(null), 3000);
			} else {
				setError(data.error || 'Failed to update profile');
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			setError('An unexpected error occurred');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			name: profile.name || '',
			email: profile.email || '',
			bio: profile.bio || '',
			website: profile.website || '',
		});
		setEditing(false);
		setError(null);
		setSuccess(null);
	};

	const handlePasswordChange = async () => {
		setChangingPassword(true);
		setError(null);

		try {
			// Validation
			if (!passwordData.currentPassword || !passwordData.newPassword) {
				setError('Both current and new passwords are required');
				setChangingPassword(false);
				return;
			}

			if (passwordData.newPassword !== passwordData.confirmPassword) {
				setError('New passwords do not match');
				setChangingPassword(false);
				return;
			}

			if (passwordData.newPassword.length < 6) {
				setError('New password must be at least 6 characters long');
				setChangingPassword(false);
				return;
			}

			const response = await fetch('/api/admin/users/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentPassword: passwordData.currentPassword,
					newPassword: passwordData.newPassword,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setPasswordData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
				setShowPasswordDialog(false);
				setSuccess('Password updated successfully!');
				setTimeout(() => setSuccess(null), 3000);
			} else {
				setError(data.error || 'Failed to update password');
			}
		} catch (error) {
			console.error('Error updating password:', error);
			setError('An unexpected error occurred');
		} finally {
			setChangingPassword(false);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Profile
					</h1>
					<p className='text-muted-foreground mt-1'>
						Manage your admin profile and preferences
					</p>
				</div>
				<div className='flex gap-2'>
					{editing ? (
						<>
							<Button
								variant='outline'
								onClick={handleCancel}
								disabled={saving}
							>
								<X className='h-4 w-4 mr-2' />
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								disabled={saving}
							>
								<Save className='h-4 w-4 mr-2' />
								{saving ? 'Saving...' : 'Save Changes'}
							</Button>
						</>
					) : (
						<>
							<Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
								<DialogTrigger asChild>
									<Button variant='outline'>
										<Lock className='h-4 w-4 mr-2' />
										Change Password
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-md'>
									<DialogHeader>
										<DialogTitle className='flex items-center gap-2'>
											<Lock className='h-5 w-5' />
											Change Password
										</DialogTitle>
										<DialogDescription>
											Enter your current password and a new password to update your account.
										</DialogDescription>
									</DialogHeader>
									<div className='space-y-4 pt-4'>
										{error && (
											<Alert variant='destructive'>
												<AlertCircle className='h-4 w-4' />
												<AlertDescription>{error}</AlertDescription>
											</Alert>
										)}
										<div className='space-y-2'>
											<Label htmlFor='currentPassword'>Current Password</Label>
											<Input
												id='currentPassword'
												type='password'
												value={passwordData.currentPassword}
												onChange={(e) => {
													setPasswordData({
														...passwordData,
														currentPassword: e.target.value
													});
													setError(null);
												}}
												placeholder='Enter current password'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='newPassword'>New Password</Label>
											<Input
												id='newPassword'
												type='password'
												value={passwordData.newPassword}
												onChange={(e) => {
													setPasswordData({
														...passwordData,
														newPassword: e.target.value
													});
													setError(null);
												}}
												placeholder='Enter new password (min. 6 characters)'
											/>
											<p className='text-xs text-muted-foreground'>
												Password must be at least 6 characters long
											</p>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='confirmPassword'>Confirm New Password</Label>
											<Input
												id='confirmPassword'
												type='password'
												value={passwordData.confirmPassword}
												onChange={(e) => {
													setPasswordData({
														...passwordData,
														confirmPassword: e.target.value
													});
													setError(null);
												}}
												placeholder='Confirm new password'
												className={
													passwordData.confirmPassword &&
													passwordData.newPassword !== passwordData.confirmPassword
														? 'border-red-500'
														: ''
												}
											/>
											{passwordData.confirmPassword &&
												passwordData.newPassword !== passwordData.confirmPassword && (
													<p className='text-xs text-red-500'>
														Passwords do not match
													</p>
												)}
										</div>
										<div className='flex justify-end gap-2 pt-2'>
											<Button
												variant='outline'
												onClick={() => {
													setShowPasswordDialog(false);
													setPasswordData({
														currentPassword: '',
														newPassword: '',
														confirmPassword: '',
													});
													setError(null);
												}}
											>
												Cancel
											</Button>
											<Button
												onClick={handlePasswordChange}
												disabled={changingPassword}
											>
												{changingPassword ? 'Changing...' : 'Change Password'}
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
							<Button onClick={() => setEditing(true)}>
								<Edit className='h-4 w-4 mr-2' />
								Edit Profile
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Error/Success Alerts */}
			{error && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			{success && (
				<Alert className='border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'>
					<CheckCircle className='h-4 w-4' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Profile Overview Card */}
				<div className='lg:col-span-1'>
					<Card className='h-full'>
						<CardHeader className='text-center pb-4'>
							<div className='relative inline-block mb-4'>
								<Avatar className='h-28 w-28 mx-auto border-4 border-background shadow-lg'>
									<AvatarImage
										src={profile?.avatar}
										alt={profile?.name}
										className='object-cover'
									/>
									<AvatarFallback className='text-2xl font-semibold bg-primary text-primary-foreground'>
										{profile?.name?.charAt(0)?.toUpperCase() || 'A'}
									</AvatarFallback>
								</Avatar>
								{editing && (
									<Button
										size='sm'
										variant='secondary'
										className='absolute bottom-0 right-0 rounded-full h-9 w-9 p-0 shadow-md hover:shadow-lg transition-shadow'
										title='Change avatar'
									>
										<Camera className='h-4 w-4' />
									</Button>
								)}
							</div>
							<CardTitle className='text-xl'>
								{profile?.name || 'Admin User'}
							</CardTitle>
							<CardDescription className='text-base mt-1'>
								{profile?.email}
							</CardDescription>
							<div className='mt-3'>
								<Badge
									variant='secondary'
									className='px-3 py-1'
								>
									<Shield className='h-3.5 w-3.5 mr-1.5' />
									{profile?.role || 'ADMIN'}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className='pt-6'>
							<div className='space-y-4'>
								{/* Posts Stat */}
								<div className='flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
									<div className='flex items-center gap-3'>
										<div className='p-2 rounded-md bg-primary/10'>
											<FileText className='h-5 w-5 text-primary' />
										</div>
										<div>
											<p className='text-sm font-medium text-muted-foreground'>
												Posts Created
											</p>
											<p className='text-2xl font-bold'>
												{profile?.postsCount || 0}
											</p>
										</div>
									</div>
								</div>
								<Separator />
								{/* Comments Stat */}
								<div className='flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
									<div className='flex items-center gap-3'>
										<div className='p-2 rounded-md bg-primary/10'>
											<MessageSquare className='h-5 w-5 text-primary' />
										</div>
										<div>
											<p className='text-sm font-medium text-muted-foreground'>
												Comments Made
											</p>
											<p className='text-2xl font-bold'>
												{profile?.commentsCount || 0}
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Profile Details */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Profile Information Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<User className='h-5 w-5' />
								Profile Information
							</CardTitle>
							<CardDescription>
								Update your personal information and preferences
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Name and Email Row */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label htmlFor='name' className='flex items-center gap-2'>
										<User className='h-4 w-4 text-muted-foreground' />
										Full Name <span className='text-red-500'>*</span>
									</Label>
									{editing ? (
										<>
											<Input
												id='name'
												value={formData.name}
												onChange={(e) =>
													setFormData({
														...formData,
														name: e.target.value,
													})
												}
												placeholder='Your full name'
												required
												className={!formData.name.trim() ? 'border-red-500' : ''}
											/>
											{!formData.name.trim() && (
												<p className='text-xs text-red-500'>Name is required</p>
											)}
										</>
									) : (
										<div className='flex items-center gap-3 p-3 border rounded-lg bg-muted/30'>
											<User className='h-4 w-4 text-muted-foreground flex-shrink-0' />
											<span className='font-medium'>
												{profile?.name || 'Not set'}
											</span>
										</div>
									)}
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email' className='flex items-center gap-2'>
										<Mail className='h-4 w-4 text-muted-foreground' />
										Email Address <span className='text-red-500'>*</span>
									</Label>
									{editing ? (
										<>
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
												placeholder='your.email@example.com'
												required
												className={
													!formData.email.trim() ||
													!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
														? 'border-red-500'
														: ''
												}
											/>
											{(!formData.email.trim() ||
												!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) && (
												<p className='text-xs text-red-500'>
													{!formData.email.trim()
														? 'Email is required'
														: 'Please enter a valid email address'}
												</p>
											)}
										</>
									) : (
										<div className='flex items-center gap-3 p-3 border rounded-lg bg-muted/30'>
											<Mail className='h-4 w-4 text-muted-foreground flex-shrink-0' />
											<span className='font-medium'>{profile?.email}</span>
										</div>
									)}
								</div>
							</div>

							<Separator />

							{/* Bio Section */}
							<div className='space-y-2'>
								<Label htmlFor='bio' className='flex items-center gap-2'>
									<FileText className='h-4 w-4 text-muted-foreground' />
									Bio
								</Label>
								{editing ? (
									<Textarea
										id='bio'
										value={formData.bio}
										onChange={(e) =>
											setFormData({
												...formData,
												bio: e.target.value,
											})
										}
										placeholder='Tell us about yourself...'
										rows={4}
										className='resize-none'
									/>
								) : (
									<div className='p-4 border rounded-lg bg-muted/30 min-h-[100px]'>
										{profile?.bio ? (
											<p className='text-sm leading-relaxed whitespace-pre-wrap'>
												{profile.bio}
											</p>
										) : (
											<p className='text-sm text-muted-foreground italic'>
												No bio provided
											</p>
										)}
									</div>
								)}
							</div>

							<Separator />

							{/* Website Section */}
							<div className='space-y-2'>
								<Label htmlFor='website' className='flex items-center gap-2'>
									<Globe className='h-4 w-4 text-muted-foreground' />
									Website
								</Label>
								{editing ? (
									<Input
										id='website'
										value={formData.website}
										onChange={(e) =>
											setFormData({
												...formData,
												website: e.target.value,
											})
										}
										placeholder='https://yourwebsite.com'
										type='url'
									/>
								) : (
									<div className='flex items-center gap-3 p-3 border rounded-lg bg-muted/30'>
										<Globe className='h-4 w-4 text-muted-foreground flex-shrink-0' />
										{profile?.website ? (
											<a
												href={profile.website}
												target='_blank'
												rel='noopener noreferrer'
												className='text-primary hover:underline font-medium'
											>
												{profile.website}
											</a>
										) : (
											<span className='text-muted-foreground italic'>Not set</span>
										)}
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Account Information Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<UserCheck className='h-5 w-5' />
								Account Information
							</CardTitle>
							<CardDescription>
								View your account details and activity
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label className='flex items-center gap-2 text-muted-foreground'>
										<Calendar className='h-4 w-4' />
										Member Since
									</Label>
									<div className='flex items-center gap-2 p-3 border rounded-lg bg-muted/30'>
										<Clock className='h-4 w-4 text-muted-foreground' />
										<p className='font-medium'>
											{profile?.createdAt
												? format(
														new Date(profile.createdAt),
														'MMMM dd, yyyy'
												  )
												: 'Unknown'}
										</p>
									</div>
								</div>
								<div className='space-y-2'>
									<Label className='flex items-center gap-2 text-muted-foreground'>
										<Clock className='h-4 w-4' />
										Last Updated
									</Label>
									<div className='flex items-center gap-2 p-3 border rounded-lg bg-muted/30'>
										<Clock className='h-4 w-4 text-muted-foreground' />
										<p className='font-medium'>
											{profile?.updatedAt
												? format(
														new Date(profile.updatedAt),
														'MMMM dd, yyyy'
												  )
												: 'Unknown'}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
