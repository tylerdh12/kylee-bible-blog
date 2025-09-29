import { prisma } from '@/lib/prisma';
import type {
	User,
	Post,
	Goal,
	Donation,
	Tag,
	PaginationOptions,
	SortOption,
} from '@/types';

interface DatabaseAdapter {
	// User operations
	findUserByEmail(email: string): Promise<User | null>;
	findUserById(id: string): Promise<User | null>;
	createUser(
		data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'posts' | 'comments'>
	): Promise<User>;

	// Post operations
	findPosts(options?: {
		published?: boolean;
		take?: number;
		pagination?: PaginationOptions;
		sort?: SortOption<keyof Post>;
		includeAuthor?: boolean;
		includeTags?: boolean;
	}): Promise<Post[]>;

	findPostBySlug(
		slug: string,
		published?: boolean
	): Promise<Post | null>;
	createPost(
		data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments'>
	): Promise<Post>;
	updatePost(
		id: string,
		data: Partial<Post>
	): Promise<Post | null>;
	deletePost(id: string): Promise<boolean>;

	// Goal operations
	findGoals(options?: {
		completed?: boolean;
		take?: number;
		pagination?: PaginationOptions;
		sort?: SortOption<keyof Goal>;
		includeDonations?: boolean;
	}): Promise<Goal[]>;

	findGoalById(id: string): Promise<Goal | null>;
	createGoal(
		data: Omit<
			Goal,
			'id' | 'createdAt' | 'updatedAt' | 'donations'
		>
	): Promise<Goal>;
	updateGoal(
		id: string,
		data: Partial<Goal>
	): Promise<Goal | null>;
	deleteGoal(id: string): Promise<boolean>;

	// Donation operations
	findDonations(options?: {
		goalId?: string;
		pagination?: PaginationOptions;
		sort?: SortOption<keyof Donation>;
		includeGoal?: boolean;
	}): Promise<Donation[]>;

	createDonation(
		data: Omit<Donation, 'id' | 'createdAt'>
	): Promise<Donation>;

	// Tag operations
	findOrCreateTag(name: string): Promise<Tag>;
	findTags(): Promise<Tag[]>;

	// Statistics
	getStats(): Promise<{
		totalPosts: number;
		publishedPosts: number;
		totalGoals: number;
		activeGoals: number;
		totalDonations: number;
		totalDonationAmount: number;
	}>;
}

class PrismaAdapter implements DatabaseAdapter {
	constructor(private prismaClient = prisma) {}

	async findUserByEmail(
		email: string
	): Promise<User | null> {
		return this.prismaClient.user.findUnique({
			where: { email },
		}) as Promise<User | null>;
	}

	async findUserById(id: string): Promise<User | null> {
		return this.prismaClient.user.findUnique({
			where: { id },
		}) as Promise<User | null>;
	}

	async createUser(
		data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'posts' | 'comments'>
	): Promise<User> {
		return this.prismaClient.user.create({
			data,
		}) as Promise<User>;
	}

	async findPosts(
		options: {
			published?: boolean;
			take?: number;
			pagination?: PaginationOptions;
			sort?: SortOption<keyof Post>;
			includeAuthor?: boolean;
			includeTags?: boolean;
		} = {}
	): Promise<Post[]> {
		const {
			published,
			take,
			pagination,
			sort = { field: 'publishedAt', order: 'desc' },
			includeAuthor = true,
			includeTags = true,
		} = options;

		const posts = await this.prismaClient.post.findMany({
			where:
				published !== undefined ? { published } : undefined,
			include: {
				author: includeAuthor,
				tags: includeTags,
			},
			orderBy: { [sort.field]: sort.order },
			take,
			skip: pagination
				? pagination.page * pagination.limit
				: undefined,
		});
		return posts as Post[];
	}

	async findPostBySlug(
		slug: string,
		published?: boolean
	): Promise<Post | null> {
		return this.prismaClient.post.findFirst({
			where: {
				slug,
				...(published !== undefined && { published }),
			},
			include: {
				author: true,
				tags: true,
			},
		});
	}

	async createPost(
		data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments'>
	): Promise<Post> {
		const { tags, author: _author, ...postData } = data;
		const result = await this.prismaClient.post.create({
			data: {
				...postData,
				tags: {
					connect: tags.map((tag) => ({ id: tag.id })),
				},
			},
			include: {
				author: true,
				tags: true,
			},
		});
		return result as Post;
	}

	async updatePost(
		id: string,
		data: Partial<Post>
	): Promise<Post | null> {
		const { tags, author: _author, comments: _comments, ...postData } = data;
		const result = await this.prismaClient.post.update({
			where: { id },
			data: {
				...postData,
				...(tags && {
					tags: {
						set: tags.map((tag) => ({ id: tag.id })),
					},
				}),
			},
			include: {
				author: true,
				tags: true,
			},
		});
		return result as Post;
	}

	async deletePost(id: string): Promise<boolean> {
		try {
			await this.prismaClient.post.delete({ where: { id } });
			return true;
		} catch {
			return false;
		}
	}

	async findGoals(
		options: {
			completed?: boolean;
			take?: number;
			pagination?: PaginationOptions;
			sort?: SortOption<keyof Goal>;
			includeDonations?: boolean;
		} = {}
	): Promise<Goal[]> {
		const {
			completed,
			take,
			pagination,
			sort = { field: 'createdAt', order: 'desc' },
			includeDonations = true,
		} = options;

		return this.prismaClient.goal.findMany({
			where:
				completed !== undefined ? { completed } : undefined,
			include: {
				donations: includeDonations,
			},
			orderBy:
				sort.field === 'createdAt'
					? [
							{ completed: 'asc' },
							{ [sort.field]: sort.order },
					  ]
					: { [sort.field]: sort.order },
			take,
			skip: pagination
				? pagination.page * pagination.limit
				: undefined,
		});
	}

	async findGoalById(id: string): Promise<Goal | null> {
		return this.prismaClient.goal.findUnique({
			where: { id },
			include: { donations: true },
		});
	}

	async createGoal(
		data: Omit<
			Goal,
			'id' | 'createdAt' | 'updatedAt' | 'donations'
		>
	): Promise<Goal> {
		return this.prismaClient.goal.create({
			data,
			include: { donations: true },
		});
	}

	async updateGoal(
		id: string,
		data: Partial<Goal>
	): Promise<Goal | null> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { donations: _donations, ...goalData } = data;
		return this.prismaClient.goal.update({
			where: { id },
			data: goalData,
			include: { donations: true },
		});
	}

	async deleteGoal(id: string): Promise<boolean> {
		try {
			await this.prismaClient.goal.delete({ where: { id } });
			return true;
		} catch {
			return false;
		}
	}

	async findDonations(
		options: {
			goalId?: string;
			pagination?: PaginationOptions;
			sort?: SortOption<keyof Donation>;
			includeGoal?: boolean;
		} = {}
	): Promise<Donation[]> {
		const {
			goalId,
			pagination,
			sort = { field: 'createdAt', order: 'desc' },
			includeGoal = true,
		} = options;

		const result = await this.prismaClient.donation.findMany({
			where: goalId ? { goalId } : undefined,
			include: {
				goal: includeGoal,
			},
			orderBy: { [sort.field]: sort.order },
			skip: pagination
				? pagination.page * pagination.limit
				: undefined,
			take: pagination?.limit,
		});

		return result as Donation[];
	}

	async createDonation(
		data: Omit<Donation, 'id' | 'createdAt'>
	): Promise<Donation> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { goal: _goal, ...donationData } = data;
		const donation = await this.prismaClient.donation.create({
			data: donationData,
			include: { goal: true },
		});

		// Update goal's current amount if linked and check for completion
		if (data.goalId) {
			const goal = await this.prismaClient.goal.findUnique({
				where: { id: data.goalId },
			});

			if (goal) {
				const newAmount = goal.currentAmount + data.amount;
				await this.prismaClient.goal.update({
					where: { id: data.goalId },
					data: {
						currentAmount: newAmount,
						completed: newAmount >= goal.targetAmount,
					},
				});
			}
		}

		return donation as Donation;
	}

	async findOrCreateTag(name: string): Promise<Tag> {
		return this.prismaClient.tag.upsert({
			where: { name },
			update: {},
			create: { name },
		});
	}

	async findTags(): Promise<Tag[]> {
		return this.prismaClient.tag.findMany({
			orderBy: { name: 'asc' },
		});
	}

	async getStats() {
		const [
			totalPosts,
			publishedPosts,
			totalGoals,
			activeGoals,
			totalDonations,
			donationSum,
		] = await Promise.all([
			this.prismaClient.post.count(),
			this.prismaClient.post.count({
				where: { published: true },
			}),
			this.prismaClient.goal.count(),
			this.prismaClient.goal.count({
				where: { completed: false },
			}),
			this.prismaClient.donation.count(),
			this.prismaClient.donation.aggregate({
				_sum: { amount: true },
			}),
		]);

		return {
			totalPosts,
			publishedPosts,
			totalGoals,
			activeGoals,
			totalDonations,
			totalDonationAmount: donationSum._sum.amount || 0,
		};
	}
}

// Mock adapter for development/testing (kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MockAdapter implements DatabaseAdapter {
	constructor(private mockDb: any) {}

	async findUserByEmail(
		email: string
	): Promise<User | null> {
		return this.mockDb.user.findUnique({
			where: { email },
		});
	}

	async findUserById(id: string): Promise<User | null> {
		return this.mockDb.user.findUnique({ where: { id } });
	}

	async createUser(
		data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'posts' | 'comments'>
	): Promise<User> {
		return this.mockDb.user.create({ data });
	}

	async findPosts(
		options: {
			published?: boolean;
			take?: number;
			pagination?: PaginationOptions;
			sort?: SortOption<keyof Post>;
			includeAuthor?: boolean;
			includeTags?: boolean;
		} = {}
	): Promise<Post[]> {
		const {
			published,
			take,
			includeAuthor = true,
		} = options;
		return this.mockDb.post.findMany({
			where:
				published !== undefined ? { published } : undefined,
			include: { author: includeAuthor, tags: true },
			orderBy: { publishedAt: 'desc' },
			take,
		});
	}

	async findPostBySlug(
		slug: string,
		published?: boolean
	): Promise<Post | null> {
		return this.mockDb.post.findFirst({
			where: {
				slug,
				...(published !== undefined && { published }),
			},
			include: { author: true, tags: true },
		});
	}

	async createPost(
		data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments'>
	): Promise<Post> {
		return this.mockDb.post.create({ data });
	}

	async updatePost(
		id: string,
		data: Partial<Post>
	): Promise<Post | null> {
		const post = await this.mockDb.post.findUnique({
			where: { id },
		});
		if (!post) return null;

		return this.mockDb.post.update({ where: { id }, data });
	}

	async deletePost(id: string): Promise<boolean> {
		try {
			await this.mockDb.post.delete({ where: { id } });
			return true;
		} catch {
			return false;
		}
	}

	async findGoals(
		options: {
			completed?: boolean;
			take?: number;
			pagination?: PaginationOptions;
			sort?: SortOption<keyof Goal>;
			includeDonations?: boolean;
		} = {}
	): Promise<Goal[]> {
		const {
			completed,
			take,
			includeDonations = true,
		} = options;
		return this.mockDb.goal.findMany({
			where:
				completed !== undefined ? { completed } : undefined,
			include: { donations: includeDonations },
			orderBy: [
				{ completed: 'asc' },
				{ createdAt: 'desc' },
			],
			take,
		});
	}

	async findGoalById(id: string): Promise<Goal | null> {
		return this.mockDb.goal.findUnique({
			where: { id },
			include: { donations: true },
		});
	}

	async createGoal(
		data: Omit<
			Goal,
			'id' | 'createdAt' | 'updatedAt' | 'donations'
		>
	): Promise<Goal> {
		return this.mockDb.goal.create({ data });
	}

	async updateGoal(
		id: string,
		data: Partial<Goal>
	): Promise<Goal | null> {
		return this.mockDb.goal.update({ where: { id }, data });
	}

	async deleteGoal(id: string): Promise<boolean> {
		try {
			await this.mockDb.goal.delete({ where: { id } });
			return true;
		} catch {
			return false;
		}
	}

	async findDonations(
		options: {
			goalId?: string;
			pagination?: PaginationOptions;
			sort?: SortOption<keyof Donation>;
			includeGoal?: boolean;
		} = {}
	): Promise<Donation[]> {
		const { goalId, includeGoal = true } = options;
		return this.mockDb.donation.findMany({
			where: goalId ? { goalId } : undefined,
			include: { goal: includeGoal },
			orderBy: { createdAt: 'desc' },
		});
	}

	async createDonation(
		data: Omit<Donation, 'id' | 'createdAt'>
	): Promise<Donation> {
		const donation = await this.mockDb.donation.create({
			data,
		});

		// Update goal's current amount if linked
		if (data.goalId) {
			await this.mockDb.goal.update({
				where: { id: data.goalId },
				data: {
					currentAmount: { increment: data.amount },
				},
			});
		}

		return donation;
	}

	async findOrCreateTag(name: string): Promise<Tag> {
		return this.mockDb.tag.upsert({
			where: { name },
			update: {},
			create: { name },
		});
	}

	async findTags(): Promise<Tag[]> {
		return [];
	}

	async getStats() {
		// Simple mock stats implementation
		return {
			totalPosts: 0,
			publishedPosts: 0,
			totalGoals: 0,
			activeGoals: 0,
			totalDonations: 0,
			totalDonationAmount: 0,
		};
	}
}

// Database service singleton
export class DatabaseService {
	private static instance: DatabaseService;
	private adapter: DatabaseAdapter;

	private constructor() {
		// Use real Prisma client for production functionality
		this.adapter = new PrismaAdapter();
	}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}
		return DatabaseService.instance;
	}

	// Expose all adapter methods
	async findUserByEmail(email: string) {
		return this.adapter.findUserByEmail(email);
	}

	async findUserById(id: string) {
		return this.adapter.findUserById(id);
	}

	async createUser(
		data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'posts' | 'comments'>
	) {
		return this.adapter.createUser(data);
	}

	async findPosts(
		options?: Parameters<DatabaseAdapter['findPosts']>[0]
	) {
		return this.adapter.findPosts(options);
	}

	async findPostBySlug(slug: string, published?: boolean) {
		return this.adapter.findPostBySlug(slug, published);
	}

	async createPost(
		data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments'>
	) {
		return this.adapter.createPost(data);
	}

	async updatePost(id: string, data: Partial<Post>) {
		return this.adapter.updatePost(id, data);
	}

	async deletePost(id: string) {
		return this.adapter.deletePost(id);
	}

	async findGoals(
		options?: Parameters<DatabaseAdapter['findGoals']>[0]
	) {
		return this.adapter.findGoals(options);
	}

	async findGoalById(id: string) {
		return this.adapter.findGoalById(id);
	}

	async createGoal(
		data: Omit<
			Goal,
			'id' | 'createdAt' | 'updatedAt' | 'donations'
		>
	) {
		return this.adapter.createGoal(data);
	}

	async updateGoal(id: string, data: Partial<Goal>) {
		return this.adapter.updateGoal(id, data);
	}

	async deleteGoal(id: string) {
		return this.adapter.deleteGoal(id);
	}

	async findDonations(
		options?: Parameters<
			DatabaseAdapter['findDonations']
		>[0]
	) {
		return this.adapter.findDonations(options);
	}

	async createDonation(
		data: Omit<Donation, 'id' | 'createdAt'>
	) {
		return this.adapter.createDonation(data);
	}

	async findOrCreateTag(name: string) {
		return this.adapter.findOrCreateTag(name);
	}

	async findTags() {
		return this.adapter.findTags();
	}

	async getStats() {
		return this.adapter.getStats();
	}
}

// Export singleton instance
export const db = DatabaseService.getInstance();
