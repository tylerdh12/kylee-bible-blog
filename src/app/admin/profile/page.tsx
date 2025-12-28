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

export default function ProfilePage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState(false);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		bio: '',
		website: '',
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

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await fetch('/api/admin/users/me');
			if (response.ok) {
				const data = await response.json();
				setProfile(data.user);
				setFormData({
					name: data.user.name || '',
					email: data.user.email || '',
					bio: data.user.bio || '',
					website: data.user.website || '',
				});
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
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
			name: profile?.name || '',
			email: profile?.email || '',
			bio: profile?.bio || '',
			website: profile?.website || '',
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

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>
					Loading profile...
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Profile
					</h1>
					<p className='text-muted-foreground'>
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
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Change Password</DialogTitle>
										<DialogDescription>
											Enter your current password and a new password to update your account.
										</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='currentPassword'>Current Password</Label>
											<Input
												id='currentPassword'
												type='password'
												value={passwordData.currentPassword}
												onChange={(e) => setPasswordData({
													...passwordData,
													currentPassword: e.target.value
												})}
												placeholder='Enter current password'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='newPassword'>New Password</Label>
											<Input
												id='newPassword'
												type='password'
												value={passwordData.newPassword}
												onChange={(e) => setPasswordData({
													...passwordData,
													newPassword: e.target.value
												})}
												placeholder='Enter new password'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='confirmPassword'>Confirm New Password</Label>
											<Input
												id='confirmPassword'
												type='password'
												value={passwordData.confirmPassword}
												onChange={(e) => setPasswordData({
													...passwordData,
													confirmPassword: e.target.value
												})}
												placeholder='Confirm new password'
											/>
										</div>
										<div className='flex justify-end gap-2 pt-4'>
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
				<Alert className='border-green-500 bg-green-50 text-green-700'>
					<CheckCircle className='h-4 w-4' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Profile Overview */}
				<div className='lg:col-span-1'>
					<Card>
						<CardHeader className='text-center'>
							<div className='relative inline-block'>
								<Avatar className='h-24 w-24 mx-auto mb-4'>
									<AvatarImage
										src={profile?.avatar}
										alt={profile?.name}
									/>
									<AvatarFallback className='text-lg'>
										{profile?.name?.charAt(0) || 'A'}
									</AvatarFallback>
								</Avatar>
								{editing && (
									<Button
										size='sm'
										variant='outline'
										className='absolute bottom-0 right-0 rounded-full h-8 w-8 p-0'
									>
										<Camera className='h-4 w-4' />
									</Button>
								)}
							</div>
							<CardTitle>
								{profile?.name || 'Admin User'}
							</CardTitle>
							<CardDescription>
								{profile?.email}
							</CardDescription>
							<Badge
								variant='outline'
								className='mt-2'
							>
								<Shield className='h-3 w-3 mr-1' />
								{profile?.role || 'ADMIN'}
							</Badge>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div className='text-center'>
									<p className='text-2xl font-bold'>
										{profile?.postsCount || 0}
									</p>
									<p className='text-sm text-muted-foreground'>
										Posts Created
									</p>
								</div>
								<Separator />
								<div className='text-center'>
									<p className='text-2xl font-bold'>
										{profile?.commentsCount || 0}
									</p>
									<p className='text-sm text-muted-foreground'>
										Comments Made
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Profile Details */}
				<div className='lg:col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<User className='h-5 w-5' />
								Profile Information
							</CardTitle>
							<CardDescription>
								Update your personal information and
								preferences
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Full Name *</Label>
									{editing ? (
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
									) : (
										<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
											<User className='h-4 w-4 text-muted-foreground' />
											<span>
												{profile?.name || 'Not set'}
											</span>
										</div>
									)}
									{editing && !formData.name.trim() && (
										<p className='text-xs text-red-500'>Name is required</p>
									)}
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email Address *</Label>
									{editing ? (
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
											className={!formData.email.trim() || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'border-red-500' : ''}
										/>
									) : (
										<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
											<Mail className='h-4 w-4 text-muted-foreground' />
											<span>{profile?.email}</span>
										</div>
									)}
									{editing && (!formData.email.trim() || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) && (
										<p className='text-xs text-red-500'>
											{!formData.email.trim() ? 'Email is required' : 'Please enter a valid email address'}
										</p>
									)}
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='bio'>Bio</Label>
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
									/>
								) : (
									<div className='p-3 border rounded-md bg-muted/50 min-h-[100px]'>
										{profile?.bio || 'No bio provided'}
									</div>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='website'>Website</Label>
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
									<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<span>
											{profile?.website ? (
												<a
													href={profile.website}
													target='_blank'
													rel='noopener noreferrer'
													className='text-blue-600 hover:underline'
												>
													{profile.website}
												</a>
											) : (
												'Not set'
											)}
										</span>
									</div>
								)}
							</div>

							<Separator />

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
								<div>
									<Label className='text-muted-foreground'>
										Member Since
									</Label>
									<p className='font-medium'>
										{profile?.createdAt
											? format(
													new Date(profile.createdAt),
													'MMMM dd, yyyy'
											  )
											: 'Unknown'}
									</p>
								</div>
								<div>
									<Label className='text-muted-foreground'>
										Last Updated
									</Label>
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
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
