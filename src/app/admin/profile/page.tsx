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
import {
	User,
	Mail,
	Calendar,
	Shield,
	Edit,
	Save,
	Camera,
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
	const [user, setUser] = useState<any>(null);
	const [profile, setProfile] =
		useState<UserProfile | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		bio: '',
		website: '',
	});

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		if (user) {
			fetchProfile();
		}
	}, [user]);

	const checkAuth = async () => {
		try {
			const res = await fetch('/api/auth/status');
			const data = await res.json();
			if (data.authenticated) {
				setUser(data.user);
			} else {
				window.location.href = '/admin';
			}
		} catch {
			window.location.href = '/admin';
		} finally {
			setLoading(false);
		}
	};

	const fetchProfile = async () => {
		try {
			const response = await fetch('/api/admin/users/me');
			if (response.ok) {
				const data = await response.json();
				setProfile(data.user);
				setFormData({
					name: data.user.name || '',
					bio: data.user.bio || '',
					website: data.user.website || '',
				});
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const response = await fetch('/api/admin/users/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				const data = await response.json();
				setProfile(data.user);
				setEditing(false);
			}
		} catch (error) {
			console.error('Error updating profile:', error);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			name: profile?.name || '',
			bio: profile?.bio || '',
			website: profile?.website || '',
		});
		setEditing(false);
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
						<Button onClick={() => setEditing(true)}>
							<Edit className='h-4 w-4 mr-2' />
							Edit Profile
						</Button>
					)}
				</div>
			</div>

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
									<Label htmlFor='name'>Full Name</Label>
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
										/>
									) : (
										<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
											<User className='h-4 w-4 text-muted-foreground' />
											<span>
												{profile?.name || 'Not set'}
											</span>
										</div>
									)}
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>
										Email Address
									</Label>
									<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
										<Mail className='h-4 w-4 text-muted-foreground' />
										<span>{profile?.email}</span>
									</div>
									<p className='text-xs text-muted-foreground'>
										Email cannot be changed
									</p>
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
									/>
								) : (
									<div className='flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<span>
											{profile?.website || 'Not set'}
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
