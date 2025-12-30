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
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
import {
	Alert,
	AlertDescription,
} from '@/components/ui/alert';
import {
	FileText,
	Save,
	AlertCircle,
	CheckCircle,
	Home,
	User,
	BookOpen,
	Target,
	Heart,
	DollarSign,
} from 'lucide-react';
import { SiteContentFormSkeleton } from '@/components/skeletons/admin-skeletons';

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
	// Posts Page Content
	'posts.title': {
		key: 'posts.title',
		page: 'posts',
		section: 'header',
		title: 'Page Title',
		content: 'All Blog Posts',
		contentType: 'text',
		order: 1,
	},
	'posts.description': {
		key: 'posts.description',
		page: 'posts',
		section: 'header',
		title: 'Page Description',
		content:
			"Explore all posts from Kylee's Bible study journey...",
		contentType: 'text',
		order: 2,
	},
	'posts.empty.title': {
		key: 'posts.empty.title',
		page: 'posts',
		section: 'empty',
		title: 'Empty State Title',
		content: 'No Posts Yet',
		contentType: 'text',
		order: 1,
	},
	'posts.empty.description': {
		key: 'posts.empty.description',
		page: 'posts',
		section: 'empty',
		title: 'Empty State Description',
		content:
			"Welcome to Kylee's Bible Blog! Check back soon for inspiring Bible studies and reflections.",
		contentType: 'text',
		order: 2,
	},
	'posts.empty.footer': {
		key: 'posts.empty.footer',
		page: 'posts',
		section: 'empty',
		title: 'Empty State Footer',
		content:
			"Check back soon for inspiring Bible studies and reflections on God's word.",
		contentType: 'text',
		order: 3,
	},
	// Goals Page Content
	'goals.title': {
		key: 'goals.title',
		page: 'goals',
		section: 'header',
		title: 'Page Title',
		content: 'Ministry Goals',
		contentType: 'text',
		order: 1,
	},
	'goals.description': {
		key: 'goals.description',
		page: 'goals',
		section: 'header',
		title: 'Page Description',
		content:
			"Support Kylee's Bible study journey and help spread God's word.",
		contentType: 'text',
		order: 2,
	},
	'goals.empty.title': {
		key: 'goals.empty.title',
		page: 'goals',
		section: 'empty',
		title: 'Empty State Title',
		content: 'Ministry Goals Coming Soon',
		contentType: 'text',
		order: 1,
	},
	'goals.empty.description': {
		key: 'goals.empty.description',
		page: 'goals',
		section: 'empty',
		title: 'Empty State Description',
		content:
			'Kylee is setting up ministry goals. Check back soon for opportunities to support her Bible study ministry.',
		contentType: 'text',
		order: 2,
	},
	'goals.empty.footer': {
		key: 'goals.empty.footer',
		page: 'goals',
		section: 'empty',
		title: 'Empty State Footer',
		content:
			"Check back soon for opportunities to support Kylee's ministry and help spread God's word.",
		contentType: 'text',
		order: 3,
	},
	'goals.support.title': {
		key: 'goals.support.title',
		page: 'goals',
		section: 'support',
		title: 'Support Section Title',
		content: 'Want to Support in Other Ways?',
		contentType: 'text',
		order: 1,
	},
	'goals.support.description': {
		key: 'goals.support.description',
		page: 'goals',
		section: 'support',
		title: 'Support Section Description',
		content:
			"You can also support Kylee's ministry through prayer, sharing content, or reaching out to connect.",
		contentType: 'text',
		order: 2,
	},
	// Prayer Requests Page Content
	'prayer-requests.title': {
		key: 'prayer-requests.title',
		page: 'prayer-requests',
		section: 'header',
		title: 'Page Title',
		content: 'Prayer Requests',
		contentType: 'text',
		order: 1,
	},
	'prayer-requests.description': {
		key: 'prayer-requests.description',
		page: 'prayer-requests',
		section: 'header',
		title: 'Page Description',
		content:
			'Share your prayer needs, and Kylee will lift them up before God.',
		contentType: 'text',
		order: 2,
	},
	'prayer-requests.form.title': {
		key: 'prayer-requests.form.title',
		page: 'prayer-requests',
		section: 'form',
		title: 'Form Title',
		content: 'Submit a Prayer Request',
		contentType: 'text',
		order: 1,
	},
	'prayer-requests.form.description': {
		key: 'prayer-requests.form.description',
		page: 'prayer-requests',
		section: 'form',
		title: 'Form Description',
		content:
			'Your prayer request will be kept confidential and lifted up in prayer.',
		contentType: 'text',
		order: 2,
	},
	'prayer-requests.about.title': {
		key: 'prayer-requests.about.title',
		page: 'prayer-requests',
		section: 'about',
		title: 'About Section Title',
		content: 'About Prayer Requests',
		contentType: 'text',
		order: 1,
	},
	'prayer-requests.about.content': {
		key: 'prayer-requests.about.content',
		page: 'prayer-requests',
		section: 'about',
		title: 'About Section Content',
		content:
			"Kylee believes in the power of prayer and wants to support you in your journey. Whether you're facing challenges, celebrating victories, or seeking guidance, your prayer requests matter.",
		contentType: 'text',
		order: 2,
	},
	// Donate Page Content
	'donate.title': {
		key: 'donate.title',
		page: 'donate',
		section: 'header',
		title: 'Page Title',
		content: "Support Kylee's Ministry",
		contentType: 'text',
		order: 1,
	},
	'donate.description': {
		key: 'donate.description',
		page: 'donate',
		section: 'header',
		title: 'Page Description',
		content:
			"Your generosity helps further Bible study resources, ministry outreach, and spreading God's love in our community.",
		contentType: 'text',
		order: 2,
	},
	'donate.form.title': {
		key: 'donate.form.title',
		page: 'donate',
		section: 'form',
		title: 'Form Title',
		content: 'Make a Donation',
		contentType: 'text',
		order: 1,
	},
	'donate.form.description': {
		key: 'donate.form.description',
		page: 'donate',
		section: 'form',
		title: 'Form Description',
		content:
			'Choose to support a specific goal or make a general donation to support the ministry.',
		contentType: 'text',
		order: 2,
	},
	'donate.thankyou.title': {
		key: 'donate.thankyou.title',
		page: 'donate',
		section: 'thankyou',
		title: 'Thank You Section Title',
		content: 'Thank You for Your Support!',
		contentType: 'text',
		order: 1,
	},
	'donate.thankyou.content': {
		key: 'donate.thankyou.content',
		page: 'donate',
		section: 'thankyou',
		title: 'Thank You Section Content',
		content:
			"Your donation helps Kylee continue her Bible study ministry, create valuable content, and reach more people with God's word. Every contribution, no matter the size, makes a meaningful difference.",
		contentType: 'text',
		order: 2,
	},
};

export default function SiteContentPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(
		null
	);
	const [content, setContent] =
		useState<Record<string, SiteContentItem>>(
			defaultContent
		);
	const [activeTab, setActiveTab] = useState('home');

	useEffect(() => {
		fetchContent();
	}, []);

	const fetchContent = async () => {
		try {
			const response = await fetch(
				'/api/admin/site-content'
			);
			const data = await response.json();

			if (process.env.NODE_ENV === 'development') {
				console.log('[Fetch] API response:', {
					ok: response.ok,
					status: response.status,
					contentCount: data.content?.length || 0,
				});
			}

			// Always start with defaults
			const contentMap: Record<string, SiteContentItem> = {
				...defaultContent,
			};

			if (response.ok) {
				// Merge fetched content with defaults
				if (data.content && Array.isArray(data.content)) {
					if (process.env.NODE_ENV === 'development') {
						console.log(
							`[Fetch] Processing ${data.content.length} items from database`
						);
					}
					data.content.forEach((item: SiteContentItem) => {
						// Ensure all required fields are present when merging
						const mergedItem = {
							key: item.key,
							page: item.page,
							section: item.section,
							title: item.title ?? null,
							content: item.content ?? '', // Preserve empty strings
							contentType: item.contentType || 'text',
							order: item.order || 0,
							...(item.id && { id: item.id }), // Preserve id if it exists
						};
						contentMap[item.key] = mergedItem;
						if (process.env.NODE_ENV === 'development') {
							console.log(
								`[Fetch] Merged item ${item.key}:`,
								{
									key: item.key,
									contentLength: mergedItem.content.length,
									contentPreview:
										mergedItem.content.substring(0, 50),
								}
							);
						}
					});

					// Debug logging
					if (process.env.NODE_ENV === 'development') {
						console.log(
							`[Fetch] Loaded ${data.content.length} items from database`
						);
						console.log(
							`[Fetch] Content keys:`,
							data.content.map((c: SiteContentItem) => c.key)
						);
					}
				} else {
					if (process.env.NODE_ENV === 'development') {
						console.log(
							'[Fetch] No content found in database, using defaults'
						);
					}
				}

				// Only show error if there's a specific error message and it's not just "empty content"
				if (data.error && data.code === 'TABLE_NOT_FOUND') {
					setError(
						'SiteContent table not found. Please run: npx prisma db push'
					);
				} else if (
					data.error &&
					data.error !== 'Failed to fetch site content'
				) {
					// Only show non-generic errors
					setError(data.error);
				}
				// Otherwise, silently use defaults (which is fine)
			} else {
				// API returned an error status
				if (data.code === 'TABLE_NOT_FOUND') {
					setError(
						'SiteContent table not found. Please run: npx prisma db push'
					);
				} else if (
					data.error &&
					!data.error.includes('empty')
				) {
					// Only show error if it's not about empty content
					setError(data.error);
				}
				// Otherwise, defaults will be used (no error needed)
			}

			if (process.env.NODE_ENV === 'development') {
				console.log(
					'[Fetch] Setting content map with',
					Object.keys(contentMap).length,
					'items'
				);
				console.log(
					'[Fetch] Sample content keys:',
					Object.keys(contentMap).slice(0, 5)
				);
			}

			// Create a new object to ensure React detects the state change
			const newContentMap = { ...contentMap };
			setContent(newContentMap);

			if (process.env.NODE_ENV === 'development') {
				console.log(
					'[Fetch] Content state updated. Sample values:',
					{
						'home.hero.title': newContentMap[
							'home.hero.title'
						]?.content?.substring(0, 50),
						'about.title': newContentMap[
							'about.title'
						]?.content?.substring(0, 50),
						'posts.title':
							newContentMap['posts.title']?.content,
					}
				);
			}
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Error fetching site content:', error);
			}
			// Don't show error - defaults will work fine
			// The page will function normally with default values
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			// Filter and validate content items before saving
			const itemsToSave = Object.values(content).filter(
				(item) => {
					// Ensure all required fields are present
					if (!item.key || !item.page || !item.section) {
						console.warn(
							'Skipping item with missing required fields:',
							item
						);
						return false;
					}
					return true;
				}
			);

			// Save all valid content items
			const savePromises = itemsToSave.map(async (item) => {
				try {
					// Prepare the payload - preserve empty strings and null values correctly
					const payload = {
						key: item.key,
						page: item.page,
						section: item.section,
						title: item.title ?? null,
						content: item.content ?? '', // Use nullish coalescing to preserve empty strings
						contentType: item.contentType || 'text',
						order: item.order || 0,
					};

					// Debug logging
					console.log(`[Save] Saving ${item.key}:`, {
						key: payload.key,
						page: payload.page,
						section: payload.section,
						contentLength: payload.content.length,
						contentPreview: payload.content.substring(
							0,
							50
						),
					});

					const response = await fetch(
						'/api/admin/site-content',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(payload),
						}
					);

					if (!response.ok) {
						let errorData: any = {};
						const contentType =
							response.headers.get('content-type');

						try {
							// Clone the response so we can read it without consuming the original
							const responseClone = response.clone();
							const text = await responseClone.text();

							if (text) {
								if (
									contentType &&
									contentType.includes('application/json')
								) {
									try {
										errorData = JSON.parse(text);
									} catch (jsonError) {
										console.error(
											`[Save] Failed to parse JSON error response for ${item.key}:`,
											jsonError
										);
										errorData = {
											error:
												text || `HTTP ${response.status}`,
										};
									}
								} else {
									errorData = {
										error:
											text || `HTTP ${response.status}`,
									};
								}
							} else {
								errorData = {
									error: `HTTP ${response.status}: ${
										response.statusText ||
										'No error message'
									}`,
								};
							}
						} catch (parseError) {
							console.error(
								`[Save] Failed to read error response for ${item.key}:`,
								parseError
							);
							errorData = {
								error: `HTTP ${response.status}: ${
									response.statusText || 'Unknown error'
								}`,
								status: response.status,
							};
						}

						console.error(
							`[Save] Failed to save ${item.key}:`,
							{
								status: response.status,
								statusText: response.statusText,
								error: errorData,
								message: errorData.message,
								code: errorData.code,
								details: errorData.details,
							}
						);

						const errorMessage =
							errorData.error ||
							errorData.message ||
							`HTTP ${response.status}: ${
								response.statusText || 'Unknown error'
							}`;
						return {
							ok: false,
							key: item.key,
							error: errorMessage,
						};
					}

					const responseData = await response
						.json()
						.catch(() => ({}));
					console.log(
						`[Save] Successfully saved ${item.key}`
					);
					return { ok: true, key: item.key };
				} catch (err) {
					console.error(
						`[Save] Error saving ${item.key}:`,
						err
					);
					return {
						ok: false,
						key: item.key,
						error:
							err instanceof Error
								? err.message
								: 'Unknown error',
					};
				}
			});

			const results = await Promise.all(savePromises);
			const failed = results.filter((r) => !r.ok);
			const succeeded = results.filter((r) => r.ok);

			console.log(
				`[Save] Results: ${succeeded.length} succeeded, ${failed.length} failed`
			);

			if (failed.length > 0) {
				const errorMessages = failed
					.map((f) => `${f.key}: ${f.error}`)
					.join(', ');
				setError(
					`Some content failed to save: ${errorMessages}`
				);
				console.error('[Save] Failed items:', failed);
			} else {
				setSuccess(
					`Site content saved successfully! (${succeeded.length} items)`
				);
				setTimeout(() => setSuccess(null), 5000);

				// Refresh content from database to ensure we have the latest saved values
				// This ensures the UI shows what was actually saved
				setTimeout(() => {
					fetchContent();
				}, 500);
			}
		} catch (error) {
			console.error('Error saving site content:', error);
			setError('An unexpected error occurred');
		} finally {
			setSaving(false);
		}
	};

	const updateContent = (
		key: string,
		field: string,
		value: string
	) => {
		setContent((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				[field]: value,
			},
		}));
	};

	const getContentByPage = (page: string) => {
		return Object.values(content).filter(
			(item) => item.page === page
		);
	};

	const getContentBySection = (
		page: string,
		section: string
	) => {
		return Object.values(content).filter(
			(item) =>
				item.page === page && item.section === section
		);
	};

	if (loading) {
		return <SiteContentFormSkeleton />;
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Site Content
					</h1>
					<p className='text-muted-foreground'>
						Manage the content displayed on your public
						pages
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
				<Alert className='border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'>
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
					<TabsTrigger value='posts'>
						<BookOpen className='h-4 w-4 mr-2' />
						Posts Page
					</TabsTrigger>
					<TabsTrigger value='goals'>
						<Target className='h-4 w-4 mr-2' />
						Goals Page
					</TabsTrigger>
					<TabsTrigger value='prayer-requests'>
						<Heart className='h-4 w-4 mr-2' />
						Prayer Requests
					</TabsTrigger>
					<TabsTrigger value='donate'>
						<DollarSign className='h-4 w-4 mr-2' />
						Donate Page
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
								The main heading and description on your
								home page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='home.hero.title'>
									Title
								</Label>
								<Input
									id='home.hero.title'
									value={
										content['home.hero.title']?.content ||
										''
									}
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
										content['home.hero.description']
											?.content || ''
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
										content['home.recent-posts.title']
											?.content || ''
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
								<Label htmlFor='home.goals.title'>
									Section Title
								</Label>
								<Input
									id='home.goals.title'
									value={
										content['home.goals.title']?.content ||
										''
									}
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
								The main title and subtitle for the about
								page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='about.title'>
									Page Title
								</Label>
								<Input
									id='about.title'
									value={
										content['about.title']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'about.title',
											'content',
											e.target.value
										)
									}
									placeholder='About Kylee'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='about.subtitle'>
									Subtitle
								</Label>
								<Input
									id='about.subtitle'
									value={
										content['about.subtitle']?.content || ''
									}
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
								<Label htmlFor='about.journey.title'>
									Card Title
								</Label>
								<Input
									id='about.journey.title'
									value={
										content['about.journey.title']
											?.content || ''
									}
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
									value={
										content['about.journey.content']
											?.content || ''
									}
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
								<Label htmlFor='about.find-here.title'>
									Card Title
								</Label>
								<Input
									id='about.find-here.title'
									value={
										content['about.find-here.title']
											?.content || ''
									}
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
									value={
										content['about.find-here.content']
											?.content || ''
									}
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
								<Label htmlFor='about.mission.title'>
									Card Title
								</Label>
								<Input
									id='about.mission.title'
									value={
										content['about.mission.title']
											?.content || ''
									}
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
									value={
										content['about.mission.content']
											?.content || ''
									}
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
								<Label htmlFor='about.involved.title'>
									Card Title
								</Label>
								<Input
									id='about.involved.title'
									value={
										content['about.involved.title']
											?.content || ''
									}
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
										content['about.involved.conversation']
											?.content || ''
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
									value={
										content['about.involved.support']
											?.content || ''
									}
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

				{/* Posts Page Content */}
				<TabsContent
					value='posts'
					className='space-y-6'
				>
					{/* Header Section */}
					<Card>
						<CardHeader>
							<CardTitle>Page Header</CardTitle>
							<CardDescription>
								The main title and description for the posts
								page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='posts.title'>
									Page Title
								</Label>
								<Input
									id='posts.title'
									value={
										content['posts.title']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'posts.title',
											'content',
											e.target.value
										)
									}
									placeholder='All Blog Posts'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='posts.description'>
									Page Description
								</Label>
								<Textarea
									id='posts.description'
									value={
										content['posts.description']?.content ||
										''
									}
									onChange={(e) =>
										updateContent(
											'posts.description',
											'content',
											e.target.value
										)
									}
									placeholder="Explore all posts from Kylee's Bible study journey..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Empty State Section */}
					<Card>
						<CardHeader>
							<CardTitle>Empty State</CardTitle>
							<CardDescription>
								Content shown when there are no posts
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='posts.empty.title'>
									Empty State Title
								</Label>
								<Input
									id='posts.empty.title'
									value={
										content['posts.empty.title']?.content ||
										''
									}
									onChange={(e) =>
										updateContent(
											'posts.empty.title',
											'content',
											e.target.value
										)
									}
									placeholder='No Posts Yet'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='posts.empty.description'>
									Empty State Description
								</Label>
								<Textarea
									id='posts.empty.description'
									value={
										content['posts.empty.description']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'posts.empty.description',
											'content',
											e.target.value
										)
									}
									placeholder="Welcome to Kylee's Bible Blog!..."
									rows={3}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='posts.empty.footer'>
									Empty State Footer
								</Label>
								<Textarea
									id='posts.empty.footer'
									value={
										content['posts.empty.footer']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'posts.empty.footer',
											'content',
											e.target.value
										)
									}
									placeholder='Check back soon for inspiring Bible studies...'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Goals Page Content */}
				<TabsContent
					value='goals'
					className='space-y-6'
				>
					{/* Header Section */}
					<Card>
						<CardHeader>
							<CardTitle>Page Header</CardTitle>
							<CardDescription>
								The main title and description for the goals
								page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='goals.title'>
									Page Title
								</Label>
								<Input
									id='goals.title'
									value={
										content['goals.title']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'goals.title',
											'content',
											e.target.value
										)
									}
									placeholder='Ministry Goals'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='goals.description'>
									Page Description
								</Label>
								<Textarea
									id='goals.description'
									value={
										content['goals.description']?.content ||
										''
									}
									onChange={(e) =>
										updateContent(
											'goals.description',
											'content',
											e.target.value
										)
									}
									placeholder="Support Kylee's Bible study journey..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Empty State Section */}
					<Card>
						<CardHeader>
							<CardTitle>Empty State</CardTitle>
							<CardDescription>
								Content shown when there are no goals
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='goals.empty.title'>
									Empty State Title
								</Label>
								<Input
									id='goals.empty.title'
									value={
										content['goals.empty.title']?.content ||
										''
									}
									onChange={(e) =>
										updateContent(
											'goals.empty.title',
											'content',
											e.target.value
										)
									}
									placeholder='Ministry Goals Coming Soon'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='goals.empty.description'>
									Empty State Description
								</Label>
								<Textarea
									id='goals.empty.description'
									value={
										content['goals.empty.description']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'goals.empty.description',
											'content',
											e.target.value
										)
									}
									placeholder='Kylee is setting up ministry goals...'
									rows={3}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='goals.empty.footer'>
									Empty State Footer
								</Label>
								<Textarea
									id='goals.empty.footer'
									value={
										content['goals.empty.footer']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'goals.empty.footer',
											'content',
											e.target.value
										)
									}
									placeholder='Check back soon for opportunities...'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Support Section */}
					<Card>
						<CardHeader>
							<CardTitle>Support Section</CardTitle>
							<CardDescription>
								Content for the "Want to Support in Other
								Ways?" section
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='goals.support.title'>
									Section Title
								</Label>
								<Input
									id='goals.support.title'
									value={
										content['goals.support.title']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'goals.support.title',
											'content',
											e.target.value
										)
									}
									placeholder='Want to Support in Other Ways?'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='goals.support.description'>
									Section Description
								</Label>
								<Textarea
									id='goals.support.description'
									value={
										content['goals.support.description']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'goals.support.description',
											'content',
											e.target.value
										)
									}
									placeholder="You can also support Kylee's ministry..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Prayer Requests Page Content */}
				<TabsContent
					value='prayer-requests'
					className='space-y-6'
				>
					{/* Header Section */}
					<Card>
						<CardHeader>
							<CardTitle>Page Header</CardTitle>
							<CardDescription>
								The main title and description for the
								prayer requests page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='prayer-requests.title'>
									Page Title
								</Label>
								<Input
									id='prayer-requests.title'
									value={
										content['prayer-requests.title']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'prayer-requests.title',
											'content',
											e.target.value
										)
									}
									placeholder='Prayer Requests'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='prayer-requests.description'>
									Page Description
								</Label>
								<Textarea
									id='prayer-requests.description'
									value={
										content['prayer-requests.description']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'prayer-requests.description',
											'content',
											e.target.value
										)
									}
									placeholder='Share your prayer needs, and Kylee will lift them up before God.'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Form Section */}
					<Card>
						<CardHeader>
							<CardTitle>Prayer Request Form</CardTitle>
							<CardDescription>
								Content for the prayer request submission
								form
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='prayer-requests.form.title'>
									Form Title
								</Label>
								<Input
									id='prayer-requests.form.title'
									value={
										content['prayer-requests.form.title']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'prayer-requests.form.title',
											'content',
											e.target.value
										)
									}
									placeholder='Submit a Prayer Request'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='prayer-requests.form.description'>
									Form Description
								</Label>
								<Textarea
									id='prayer-requests.form.description'
									value={
										content[
											'prayer-requests.form.description'
										]?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'prayer-requests.form.description',
											'content',
											e.target.value
										)
									}
									placeholder='Your prayer request will be kept confidential...'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* About Section */}
					<Card>
						<CardHeader>
							<CardTitle>About Prayer Requests</CardTitle>
							<CardDescription>
								Content for the "About Prayer Requests"
								section at the bottom
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='prayer-requests.about.title'>
									Section Title
								</Label>
								<Input
									id='prayer-requests.about.title'
									value={
										content['prayer-requests.about.title']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'prayer-requests.about.title',
											'content',
											e.target.value
										)
									}
									placeholder='About Prayer Requests'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='prayer-requests.about.content'>
									Section Content
								</Label>
								<Textarea
									id='prayer-requests.about.content'
									value={
										content['prayer-requests.about.content']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'prayer-requests.about.content',
											'content',
											e.target.value
										)
									}
									placeholder='Kylee believes in the power of prayer...'
									rows={6}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Donate Page Content */}
				<TabsContent
					value='donate'
					className='space-y-6'
				>
					{/* Header Section */}
					<Card>
						<CardHeader>
							<CardTitle>Page Header</CardTitle>
							<CardDescription>
								The main title and description for the
								donate page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='donate.title'>
									Page Title
								</Label>
								<Input
									id='donate.title'
									value={
										content['donate.title']?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'donate.title',
											'content',
											e.target.value
										)
									}
									placeholder="Support Kylee's Ministry"
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='donate.description'>
									Page Description
								</Label>
								<Textarea
									id='donate.description'
									value={
										content['donate.description']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'donate.description',
											'content',
											e.target.value
										)
									}
									placeholder='Your generosity helps further Bible study resources...'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Form Section */}
					<Card>
						<CardHeader>
							<CardTitle>Donation Form</CardTitle>
							<CardDescription>
								Content for the donation form section
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='donate.form.title'>
									Form Title
								</Label>
								<Input
									id='donate.form.title'
									value={
										content['donate.form.title']?.content ||
										''
									}
									onChange={(e) =>
										updateContent(
											'donate.form.title',
											'content',
											e.target.value
										)
									}
									placeholder='Make a Donation'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='donate.form.description'>
									Form Description
								</Label>
								<Textarea
									id='donate.form.description'
									value={
										content['donate.form.description']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'donate.form.description',
											'content',
											e.target.value
										)
									}
									placeholder='Choose to support a specific goal or make a general donation...'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Thank You Section */}
					<Card>
						<CardHeader>
							<CardTitle>Thank You Section</CardTitle>
							<CardDescription>
								Content for the thank you message at the
								bottom of the page
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='donate.thankyou.title'>
									Section Title
								</Label>
								<Input
									id='donate.thankyou.title'
									value={
										content['donate.thankyou.title']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'donate.thankyou.title',
											'content',
											e.target.value
										)
									}
									placeholder='Thank You for Your Support!'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='donate.thankyou.content'>
									Section Content
								</Label>
								<Textarea
									id='donate.thankyou.content'
									value={
										content['donate.thankyou.content']
											?.content || ''
									}
									onChange={(e) =>
										updateContent(
											'donate.thankyou.content',
											'content',
											e.target.value
										)
									}
									placeholder='Your donation helps Kylee continue her Bible study ministry...'
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
