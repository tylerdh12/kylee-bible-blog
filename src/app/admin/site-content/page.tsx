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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	FileText,
	Save,
	AlertCircle,
	CheckCircle,
	Home,
	User,
} from 'lucide-react';

interface SiteContentItem {
	id?: string;
	key: string;
	page: string;
	section: string;
	title?: string | null;
	content: string;
	contentType: string;
	order: number;
}

const defaultContent: Record<string, SiteContentItem> = {
	'home.hero.title': {
		key: 'home.hero.title',
		page: 'home',
		section: 'hero',
		title: 'Hero Title',
		content: "Welcome to Kylee's Blog",
		contentType: 'text',
		order: 1,
	},
	'home.hero.description': {
		key: 'home.hero.description',
		page: 'home',
		section: 'hero',
		title: 'Hero Description',
		content:
			"Join me on my Bible study journey as I explore God's word, share insights, and grow in faith. Together, we can support ministry goals and build community.",
		contentType: 'text',
		order: 2,
	},
	'home.recent-posts.title': {
		key: 'home.recent-posts.title',
		page: 'home',
		section: 'recent-posts',
		title: 'Recent Posts Section Title',
		content: 'Recent Posts',
		contentType: 'text',
		order: 1,
	},
	'home.goals.title': {
		key: 'home.goals.title',
		page: 'home',
		section: 'goals',
		title: 'Goals Section Title',
		content: 'Current Goals',
		contentType: 'text',
		order: 1,
	},
	'about.title': {
		key: 'about.title',
		page: 'about',
		section: 'header',
		title: 'Page Title',
		content: 'About Kylee',
		contentType: 'text',
		order: 1,
	},
	'about.subtitle': {
		key: 'about.subtitle',
		page: 'about',
		section: 'header',
		title: 'Page Subtitle',
		content:
			'Welcome to my corner of the internet where faith meets daily life',
		contentType: 'text',
		order: 2,
	},
	'about.journey.title': {
		key: 'about.journey.title',
		page: 'about',
		section: 'journey',
		title: 'Journey Card Title',
		content: 'My Journey',
		contentType: 'text',
		order: 1,
	},
	'about.journey.content': {
		key: 'about.journey.content',
		page: 'about',
		section: 'journey',
		title: 'Journey Card Content',
		content: `Hi! I'm Kylee, a passionate Bible student on a journey to understand God's word more deeply and share what I learn with others. This blog is my way of documenting insights, struggles, and victories as I grow in faith.

Whether you're a new believer or have been walking with Christ for years, I hope you'll find encouragement and biblical truth here that speaks to your heart and draws you closer to our Savior.

I believe that studying God's word should be accessible to everyone, regardless of their background or level of biblical knowledge. That's why I write in a way that's easy to understand while staying true to Scripture.`,
		contentType: 'text',
		order: 2,
	},
	'about.find-here.title': {
		key: 'about.find-here.title',
		page: 'about',
		section: 'find-here',
		title: "What You'll Find Here Title",
		content: "What You'll Find Here",
		contentType: 'text',
		order: 1,
	},
	'about.find-here.content': {
		key: 'about.find-here.content',
		page: 'about',
		section: 'find-here',
		title: "What You'll Find Here Content",
		content: `In-depth Bible studies and verse-by-verse explorations
Personal reflections on how Scripture applies to daily life
Prayer requests and testimonies of God's faithfulness
Resources for deeper Bible study and spiritual growth
Updates on ministry goals and how you can be involved`,
		contentType: 'list',
		order: 2,
	},
	'about.mission.title': {
		key: 'about.mission.title',
		page: 'about',
		section: 'mission',
		title: 'Mission Card Title',
		content: 'My Mission',
		contentType: 'text',
		order: 1,
	},
	'about.mission.content': {
		key: 'about.mission.content',
		page: 'about',
		section: 'mission',
		title: 'Mission Card Content',
		content: `My heart's desire is to help others fall in love with God's word the way I have. I want to make Bible study approachable, relevant, and transformative for people from all walks of life.

Through this platform, I hope to build a community where we can grow together, encourage one another, and support each other in our faith journeys. I believe that when we study God's word together, we gain insights we might miss on our own.

"Your word is a lamp for my feet, a light on my path." - Psalm 119:105`,
		contentType: 'text',
		order: 2,
	},
	'about.involved.title': {
		key: 'about.involved.title',
		page: 'about',
		section: 'involved',
		title: 'Get Involved Card Title',
		content: 'Get Involved',
		contentType: 'text',
		order: 1,
	},
	'about.involved.conversation': {
		key: 'about.involved.conversation',
		page: 'about',
		section: 'involved',
		title: 'Join the Conversation',
		content: `I'd love to hear your thoughts on the posts and studies shared here. Your insights and questions help make this community stronger.`,
		contentType: 'text',
		order: 2,
	},
	'about.involved.support': {
		key: 'about.involved.support',
		page: 'about',
		section: 'involved',
		title: 'Support the Ministry',
		content: `If God has used this ministry to bless you, consider supporting our goals to reach more people with His word.`,
		contentType: 'text',
		order: 3,
	},
};

export default function SiteContentPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [content, setContent] = useState<Record<string, SiteContentItem>>(
		defaultContent
	);
	const [activeTab, setActiveTab] = useState('home');

	useEffect(() => {
		fetchContent();
	}, []);

	const fetchContent = async () => {
		try {
			const response = await fetch('/api/admin/site-content');
			if (response.ok) {
				const data = await response.json();
				const contentMap: Record<string, SiteContentItem> = {
					...defaultContent,
				};

				// Merge fetched content with defaults
				if (data.content && Array.isArray(data.content)) {
					data.content.forEach((item: SiteContentItem) => {
						contentMap[item.key] = item;
					});
				}

				setContent(contentMap);
			} else {
				const errorData = await response.json().catch(() => ({}));
				if (errorData.code === 'TABLE_NOT_FOUND') {
					setError(
						'SiteContent table not found. Please run: npx prisma db push'
					);
				} else {
					setError(
						errorData.error ||
							'Failed to load site content. Using default values.'
					);
				}
			}
		} catch (error) {
			console.error('Error fetching site content:', error);
			setError(
				'Failed to load site content. Using default values. You can still edit and save.'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			// Save all content items
			const savePromises = Object.values(content).map((item) =>
				fetch('/api/admin/site-content', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(item),
				})
			);

			const results = await Promise.all(savePromises);
			const failed = results.filter((r) => !r.ok);

			if (failed.length > 0) {
				setError('Some content failed to save. Please try again.');
			} else {
				setSuccess('Site content saved successfully!');
				setTimeout(() => setSuccess(null), 3000);
			}
		} catch (error) {
			console.error('Error saving site content:', error);
			setError('An unexpected error occurred');
		} finally {
			setSaving(false);
		}
	};

	const updateContent = (key: string, field: string, value: string) => {
		setContent((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				[field]: value,
			},
		}));
	};

	const getContentByPage = (page: string) => {
		return Object.values(content).filter((item) => item.page === page);
	};

	const getContentBySection = (page: string, section: string) => {
		return Object.values(content).filter(
			(item) => item.page === page && item.section === section
		);
	};

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading site content...</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Site Content
					</h1>
					<p className='text-muted-foreground'>
						Manage the content displayed on your home and about pages
					</p>
				</div>
				<Button
					onClick={handleSave}
					disabled={saving}
				>
					<Save className='h-4 w-4 mr-2' />
					{saving ? 'Saving...' : 'Save All Changes'}
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

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
			>
				<TabsList>
					<TabsTrigger value='home'>
						<Home className='h-4 w-4 mr-2' />
						Home Page
					</TabsTrigger>
					<TabsTrigger value='about'>
						<User className='h-4 w-4 mr-2' />
						About Page
					</TabsTrigger>
				</TabsList>

				{/* Home Page Content */}
				<TabsContent
					value='home'
					className='space-y-6'
				>
					{/* Hero Section */}
					<Card>
						<CardHeader>
							<CardTitle>Hero Section</CardTitle>
							<CardDescription>
								The main heading and description on your home page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='home.hero.title'>Title</Label>
								<Input
									id='home.hero.title'
									value={content['home.hero.title']?.content || ''}
									onChange={(e) =>
										updateContent(
											'home.hero.title',
											'content',
											e.target.value
										)
									}
									placeholder="Welcome to Kylee's Blog"
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='home.hero.description'>
									Description
								</Label>
								<Textarea
									id='home.hero.description'
									value={
										content['home.hero.description']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'home.hero.description',
											'content',
											e.target.value
										)
									}
									placeholder='Join me on my Bible study journey...'
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Recent Posts Section */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Posts Section</CardTitle>
							<CardDescription>
								Title for the recent posts section
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='home.recent-posts.title'>
									Section Title
								</Label>
								<Input
									id='home.recent-posts.title'
									value={
										content['home.recent-posts.title']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'home.recent-posts.title',
											'content',
											e.target.value
										)
									}
									placeholder='Recent Posts'
								/>
							</div>
						</CardContent>
					</Card>

					{/* Goals Section */}
					<Card>
						<CardHeader>
							<CardTitle>Goals Section</CardTitle>
							<CardDescription>
								Title for the goals section
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='home.goals.title'>Section Title</Label>
								<Input
									id='home.goals.title'
									value={content['home.goals.title']?.content || ''}
									onChange={(e) =>
										updateContent(
											'home.goals.title',
											'content',
											e.target.value
										)
									}
									placeholder='Current Goals'
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* About Page Content */}
				<TabsContent
					value='about'
					className='space-y-6'
				>
					{/* Header Section */}
					<Card>
						<CardHeader>
							<CardTitle>Page Header</CardTitle>
							<CardDescription>
								The main title and subtitle for the about page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='about.title'>Page Title</Label>
								<Input
									id='about.title'
									value={content['about.title']?.content || ''}
									onChange={(e) =>
										updateContent('about.title', 'content', e.target.value)
									}
									placeholder='About Kylee'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.subtitle'>Subtitle</Label>
								<Input
									id='about.subtitle'
									value={content['about.subtitle']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.subtitle',
											'content',
											e.target.value
										)
									}
									placeholder='Welcome to my corner of the internet...'
								/>
							</div>
						</CardContent>
					</Card>

					{/* Journey Section */}
					<Card>
						<CardHeader>
							<CardTitle>My Journey</CardTitle>
							<CardDescription>
								Content for the "My Journey" card
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='about.journey.title'>Card Title</Label>
								<Input
									id='about.journey.title'
									value={content['about.journey.title']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.journey.title',
											'content',
											e.target.value
										)
									}
									placeholder='My Journey'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.journey.content'>
									Card Content
								</Label>
								<Textarea
									id='about.journey.content'
									value={content['about.journey.content']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.journey.content',
											'content',
											e.target.value
										)
									}
									placeholder="Hi! I'm Kylee..."
									rows={8}
								/>
							</div>
						</CardContent>
					</Card>

					{/* What You'll Find Here Section */}
					<Card>
						<CardHeader>
							<CardTitle>What You'll Find Here</CardTitle>
							<CardDescription>
								Content for the "What You'll Find Here" card
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='about.find-here.title'>Card Title</Label>
								<Input
									id='about.find-here.title'
									value={content['about.find-here.title']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.find-here.title',
											'content',
											e.target.value
										)
									}
									placeholder="What You'll Find Here"
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.find-here.content'>
									List Items (one per line)
								</Label>
								<Textarea
									id='about.find-here.content'
									value={content['about.find-here.content']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.find-here.content',
											'content',
											e.target.value
										)
									}
									placeholder='In-depth Bible studies...'
									rows={6}
								/>
								<p className='text-xs text-muted-foreground'>
									Enter each list item on a new line
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Mission Section */}
					<Card>
						<CardHeader>
							<CardTitle>My Mission</CardTitle>
							<CardDescription>
								Content for the "My Mission" card
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='about.mission.title'>Card Title</Label>
								<Input
									id='about.mission.title'
									value={content['about.mission.title']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.mission.title',
											'content',
											e.target.value
										)
									}
									placeholder='My Mission'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.mission.content'>
									Card Content
								</Label>
								<Textarea
									id='about.mission.content'
									value={content['about.mission.content']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.mission.content',
											'content',
											e.target.value
										)
									}
									placeholder="My heart's desire..."
									rows={8}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Get Involved Section */}
					<Card>
						<CardHeader>
							<CardTitle>Get Involved</CardTitle>
							<CardDescription>
								Content for the "Get Involved" card
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='about.involved.title'>Card Title</Label>
								<Input
									id='about.involved.title'
									value={content['about.involved.title']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.involved.title',
											'content',
											e.target.value
										)
									}
									placeholder='Get Involved'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.involved.conversation'>
									Join the Conversation
								</Label>
								<Textarea
									id='about.involved.conversation'
									value={
										content['about.involved.conversation']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'about.involved.conversation',
											'content',
											e.target.value
										)
									}
									placeholder="I'd love to hear your thoughts..."
									rows={4}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.involved.support'>
									Support the Ministry
								</Label>
								<Textarea
									id='about.involved.support'
									value={content['about.involved.support']?.content || ''}
									onChange={(e) =>
										updateContent(
											'about.involved.support',
											'content',
											e.target.value
										)
									}
									placeholder='If God has used this ministry...'
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
