// Core domain types
export type UserRole = 'ADMIN' | 'DEVELOPER' | 'SUBSCRIBER';

export interface User {
	id: string;
	email: string;
	password?: string | null; // Optional - passwords are stored in Account model
	name: string | null;
	role: UserRole;
	isActive: boolean;
	avatar: string | null;
	bio: string | null;
	website: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	posts?: Post[];
	comments?: Comment[];
}

export interface Post {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	published: boolean;
	publishedAt: Date | string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
	authorId: string;
	author?: User;
	tags: Tag[];
	comments?: Comment[];
}

export interface Comment {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
	authorId: string;
	author?: User;
	postId: string;
	post?: Post;
	parentId: string | null;
	parent?: Comment;
	replies?: Comment[];
}

export interface Tag {
	id: string;
	name: string;
	posts?: Post[];
}

export interface Goal {
	id: string;
	title: string;
	description: string | null;
	targetAmount: number;
	currentAmount: number;
	deadline: Date | string | null;
	completed: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
	donations: Donation[];
}

export interface Donation {
	id: string;
	amount: number;
	donorName: string | null;
	message: string | null;
	anonymous: boolean;
	createdAt: Date | string;
	goalId: string | null;
	goal?: Goal;
}

export interface PrayerRequest {
	id: string;
	name: string | null;
	email: string | null;
	request: string;
	isPrivate: boolean;
	isRead: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface Subscriber {
	id: string;
	email: string;
	name?: string;
	status: 'active' | 'inactive';
	subscribedAt: string;
	lastEmailSent?: string;
	tags: string[];
}

// API Response types
export interface ApiResponse<T = any> {
	success?: boolean;
	message?: string;
	error?: string;
	data?: T;
}

export interface AuthResponse {
	message: string;
	user: {
		id: string;
		email: string;
		name?: string;
	};
}

export interface GoalsResponse {
	goals: Goal[];
}

export interface DonationsResponse {
	donations: Donation[];
}

export interface PostsResponse {
	posts: Post[];
}

export interface StatsResponse {
	totalPosts: number;
	publishedPosts: number;
	totalGoals: number;
	activeGoals: number;
	totalDonations: number;
	totalDonationAmount: number;
	totalComments?: number;
	totalSubscribers?: number;
	totalPrayerRequests?: number;
}

// Form types
export interface LoginForm {
	email: string;
	password: string;
}

export interface GoalForm {
	title: string;
	description?: string;
	targetAmount: number;
	deadline?: string;
}

export interface DonationForm {
	amount: number;
	donorName?: string;
	message?: string;
	anonymous: boolean;
	goalId?: string;
}

export interface PrayerRequestForm {
	name?: string;
	email?: string;
	request: string;
	isPrivate: boolean;
}

export interface PostForm {
	title: string;
	content: string;
	excerpt?: string;
	published: boolean;
	tags: string[];
}

// UI Component types
export interface UIUser {
	id: string;
	name: string | null;
	email: string;
	role: 'ADMIN' | 'DEVELOPER' | 'SUBSCRIBER';
	isActive: boolean;
	avatar?: string;
	bio?: string | null;
	website?: string | null;
}

// Component prop types
export interface ProgressBarProps {
	current: number;
	target: number;
	className?: string;
}

export interface GoalCardProps {
	goal: Goal;
	showActions?: boolean;
}

export interface DonationCardProps {
	donation: Donation;
}

export interface PostCardProps {
	post: Post;
	showExcerpt?: boolean;
}

// Utility types
export type SortOrder = 'asc' | 'desc';

export interface SortOption<T = string> {
	field: T;
	order: SortOrder;
}

export interface PaginationOptions {
	page: number;
	limit: number;
}

export interface FilterOptions {
	published?: boolean;
	completed?: boolean;
	anonymous?: boolean;
}
