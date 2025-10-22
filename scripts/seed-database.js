#!/usr/bin/env node

/**
 * Database Seeding Script
 *
 * This script seeds the database with initial data for development and production.
 * It creates sample content, admin users, and initial configuration.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Configuration
const config = {
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development',
	verbose:
		process.env.VERBOSE === 'true' ||
		process.env.NODE_ENV === 'development',
	databaseUrl: process.env.DATABASE_URL,
};

// Utility functions
function log(message, type = 'info') {
	const timestamp = new Date().toISOString();
	const prefix =
		{
			info: 'ℹ️',
			success: '✅',
			warning: '⚠️',
			error: '❌',
			step: '🔄',
		}[type] || 'ℹ️';

	console.log(`${prefix} [${timestamp}] ${message}`);
}

function logStep(step, total, message) {
	log(`[${step}/${total}] ${message}`, 'step');
}

// Sample data
const sampleData = {
	users: [
		{
			email: 'kylee@example.com',
			name: 'Kylee',
			role: 'ADMIN',
			isActive: true,
			bio: 'Bible study enthusiast and ministry leader',
			website: 'https://kyleesblog.com',
		},
	],

	posts: [
		{
			title: 'Welcome to My Bible Study Blog',
			slug: 'welcome-to-my-bible-study-blog',
			content: `
        <h2>Welcome to My Bible Study Journey</h2>
        <p>Hello and welcome to my Bible study blog! I'm so excited to share this journey with you as we explore God's word together.</p>
        
        <h3>What You Can Expect</h3>
        <p>In this blog, you'll find:</p>
        <ul>
          <li>Weekly Bible study insights</li>
          <li>Prayer requests and testimonies</li>
          <li>Ministry updates and goals</li>
          <li>Resources for spiritual growth</li>
        </ul>
        
        <h3>Join the Community</h3>
        <p>I encourage you to:</p>
        <ul>
          <li>Submit prayer requests</li>
          <li>Support ministry goals</li>
          <li>Share your own insights</li>
          <li>Connect with other believers</li>
        </ul>
        
        <p>Thank you for being part of this community. Let's grow together in faith!</p>
        
        <p><em>Blessings,<br>Kylee</em></p>
      `,
			excerpt:
				'Welcome to my Bible study blog! Join me on this journey of faith and spiritual growth.',
			published: true,
			publishedAt: new Date(),
			tags: ['Welcome', 'Bible Study', 'Community'],
		},
		{
			title: 'The Power of Prayer in Daily Life',
			slug: 'power-of-prayer-daily-life',
			content: `
        <h2>The Power of Prayer in Daily Life</h2>
        <p>Prayer is one of the most powerful tools we have as believers. It's our direct line of communication with our Heavenly Father.</p>
        
        <h3>Why Prayer Matters</h3>
        <p>Prayer is not just a religious ritual—it's a vital part of our relationship with God. Through prayer, we:</p>
        <ul>
          <li>Express our gratitude and praise</li>
          <li>Seek guidance and wisdom</li>
          <li>Find peace in difficult times</li>
          <li>Intercede for others</li>
        </ul>
        
        <h3>Making Prayer a Daily Habit</h3>
        <p>Here are some practical tips for incorporating prayer into your daily routine:</p>
        <ol>
          <li><strong>Start your day with prayer</strong> - Begin each morning by thanking God for a new day</li>
          <li><strong>Pray throughout the day</strong> - Don't save prayer for just morning and evening</li>
          <li><strong>Keep a prayer journal</strong> - Write down your prayers and God's answers</li>
          <li><strong>Pray with others</strong> - Join prayer groups or pray with family and friends</li>
        </ol>
        
        <h3>Prayer Requests</h3>
        <p>I want to pray for you! Please feel free to submit your prayer requests through the prayer request form. I believe in the power of intercessory prayer and would be honored to lift up your needs before the Lord.</p>
        
        <p>Remember, "The prayer of a righteous person is powerful and effective" (James 5:16).</p>
        
        <p><em>May God bless you abundantly,<br>Kylee</em></p>
      `,
			excerpt:
				'Discover the transformative power of prayer in your daily life and learn practical ways to make prayer a consistent habit.',
			published: true,
			publishedAt: new Date(Date.now() - 86400000), // 1 day ago
			tags: ['Prayer', 'Spiritual Growth', 'Daily Life'],
		},
	],

	goals: [
		{
			title: 'Bible Study Resources',
			description:
				'Create and distribute Bible study materials, workbooks, and resources to help others grow in their faith.',
			targetAmount: 5000,
			currentAmount: 1250,
			deadline: new Date(
				Date.now() + 90 * 24 * 60 * 60 * 1000
			), // 90 days from now
			completed: false,
		},
		{
			title: 'Ministry Outreach Program',
			description:
				'Fund community outreach programs, food drives, and support for families in need.',
			targetAmount: 10000,
			currentAmount: 3200,
			deadline: new Date(
				Date.now() + 180 * 24 * 60 * 60 * 1000
			), // 180 days from now
			completed: false,
		},
		{
			title: 'Youth Ministry Equipment',
			description:
				'Purchase audio equipment, Bibles, and materials for youth ministry programs.',
			targetAmount: 3000,
			currentAmount: 3000,
			deadline: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			), // 30 days from now
			completed: true,
		},
	],

	donations: [
		{
			amount: 100,
			donorName: 'Sarah Johnson',
			message:
				'Thank you for your ministry! Praying for your success.',
			anonymous: false,
			goalId: null, // General donation
		},
		{
			amount: 250,
			donorName: null,
			message: 'God bless your work in the community.',
			anonymous: true,
			goalId: null, // General donation
		},
		{
			amount: 500,
			donorName: 'Michael Chen',
			message:
				'Excited to support the Bible study resources goal!',
			anonymous: false,
			goalId: null, // Will be linked to first goal
		},
	],

	prayerRequests: [
		{
			name: 'Jennifer',
			email: 'jennifer@example.com',
			request:
				"Please pray for my family as we navigate a difficult season. We need God's guidance and peace.",
			isPrivate: true,
			isRead: false,
		},
		{
			name: null,
			email: null,
			request:
				'Praying for healing and strength during my recovery from surgery. Thank you for your prayers.',
			isPrivate: true,
			isRead: true,
		},
		{
			name: 'David',
			email: 'david@example.com',
			request:
				'Please pray for my job search. I trust God has the right opportunity for me.',
			isPrivate: true,
			isRead: false,
		},
	],
};

// Seeding functions
async function seedUsers() {
	logStep(1, 6, 'Seeding users...');

	try {
		// Check if users already exist
		const existingUsers = await prisma.user.findMany();
		if (existingUsers.length > 0) {
			log(
				'Users already exist, skipping user seeding',
				'warning'
			);
			return existingUsers;
		}

		const users = [];
		for (const userData of sampleData.users) {
			// Hash password for admin user with environment variable or fallback
			const defaultPassword =
				process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
			const hashedPassword = await bcrypt.hash(
				defaultPassword,
				12
			);

			const user = await prisma.user.create({
				data: {
					...userData,
					password: hashedPassword,
				},
			});
			users.push(user);
			log(`Created user: ${user.email}`, 'success');
		}

		return users;
	} catch (error) {
		log(`Failed to seed users: ${error.message}`, 'error');
		throw error;
	}
}

async function seedTags() {
	logStep(2, 6, 'Seeding tags...');

	try {
		const allTags = new Set();
		sampleData.posts.forEach((post) => {
			post.tags.forEach((tag) => allTags.add(tag));
		});

		const tags = [];
		for (const tagName of allTags) {
			const tag = await prisma.tag.upsert({
				where: { name: tagName },
				update: {},
				create: { name: tagName },
			});
			tags.push(tag);
			log(`Created/updated tag: ${tag.name}`, 'success');
		}

		return tags;
	} catch (error) {
		log(`Failed to seed tags: ${error.message}`, 'error');
		throw error;
	}
}

async function seedPosts(users, tags) {
	logStep(3, 6, 'Seeding posts...');

	try {
		const posts = [];
		for (const postData of sampleData.posts) {
			// Find the author (first admin user)
			const author = users.find((u) => u.role === 'ADMIN');
			if (!author) {
				throw new Error(
					'No admin user found for post creation'
				);
			}

			// Find tag IDs
			const postTags = tags.filter((tag) =>
				postData.tags.includes(tag.name)
			);

			const post = await prisma.post.create({
				data: {
					title: postData.title,
					slug: postData.slug,
					content: postData.content,
					excerpt: postData.excerpt,
					published: postData.published,
					publishedAt: postData.publishedAt,
					authorId: author.id,
					tags: {
						connect: postTags.map((tag) => ({
							id: tag.id,
						})),
					},
				},
			});
			posts.push(post);
			log(`Created post: ${post.title}`, 'success');
		}

		return posts;
	} catch (error) {
		log(`Failed to seed posts: ${error.message}`, 'error');
		throw error;
	}
}

async function seedGoals() {
	logStep(4, 6, 'Seeding goals...');

	try {
		const goals = [];
		for (const goalData of sampleData.goals) {
			const goal = await prisma.goal.create({
				data: goalData,
			});
			goals.push(goal);
			log(`Created goal: ${goal.title}`, 'success');
		}

		return goals;
	} catch (error) {
		log(`Failed to seed goals: ${error.message}`, 'error');
		throw error;
	}
}

async function seedDonations(goals) {
	logStep(5, 6, 'Seeding donations...');

	try {
		const donations = [];
		for (const donationData of sampleData.donations) {
			// Link some donations to goals
			let goalId = donationData.goalId;
			if (!goalId && goals.length > 0) {
				// Link first donation to first goal
				if (donations.length === 0) {
					goalId = goals[0].id;
				}
			}

			const donation = await prisma.donation.create({
				data: {
					...donationData,
					goalId,
				},
			});
			donations.push(donation);
			log(
				`Created donation: $${donation.amount}`,
				'success'
			);
		}

		return donations;
	} catch (error) {
		log(
			`Failed to seed donations: ${error.message}`,
			'error'
		);
		throw error;
	}
}

async function seedPrayerRequests() {
	logStep(6, 6, 'Seeding prayer requests...');

	try {
		const prayerRequests = [];
		for (const requestData of sampleData.prayerRequests) {
			const request = await prisma.prayerRequest.create({
				data: requestData,
			});
			prayerRequests.push(request);
			log(
				`Created prayer request from: ${
					request.name || 'Anonymous'
				}`,
				'success'
			);
		}

		return prayerRequests;
	} catch (error) {
		log(
			`Failed to seed prayer requests: ${error.message}`,
			'error'
		);
		throw error;
	}
}

// Main seeding function
async function main() {
	try {
		log('Starting database seeding...', 'info');
		log(
			`Environment: ${
				config.isProduction ? 'Production' : 'Development'
			}`,
			'info'
		);

		// Check if we should seed
		if (config.isProduction) {
			const existingData = await prisma.user.count();
			if (existingData > 0) {
				log(
					'Production database already has data, skipping seeding',
					'warning'
				);
				return;
			}
		}

		const users = await seedUsers();
		const tags = await seedTags();
		const posts = await seedPosts(users, tags);
		const goals = await seedGoals();
		const donations = await seedDonations(goals);
		const prayerRequests = await seedPrayerRequests();

		log(
			'Database seeding completed successfully! 🎉',
			'success'
		);
		log(
			`Created: ${users.length} users, ${tags.length} tags, ${posts.length} posts, ${goals.length} goals, ${donations.length} donations, ${prayerRequests.length} prayer requests`,
			'info'
		);
	} catch (error) {
		log('Database seeding failed!', 'error');
		log(`Error: ${error.message}`, 'error');
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Handle script execution
if (require.main === module) {
	main().catch((error) => {
		console.error('Seeding failed:', error);
		process.exit(1);
	});
}

module.exports = {
	main,
	sampleData,
	config,
};
