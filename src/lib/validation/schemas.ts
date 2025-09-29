import { z, ZodError } from 'zod';

// Donation validation schemas
export const createDonationSchema = z.object({
	amount: z
		.number()
		.min(1, 'Donation amount must be at least 1')
		.max(100000, 'Donation amount cannot exceed 100,000')
		.finite('Donation amount must be a valid number'),
	donorName: z
		.string()
		.max(100, 'Donor name cannot exceed 100 characters')
		.trim()
		.optional()
		.nullable(),
	message: z
		.string()
		.max(500, 'Message cannot exceed 500 characters')
		.trim()
		.optional()
		.nullable(),
	anonymous: z.boolean().default(false),
	goalId: z
		.union([
			z.string().uuid('Invalid goal ID format'),
			z.null(),
		])
		.optional(),
});

export const donationQuerySchema = z.object({
	take: z
		.string()
		.regex(/^\d+$/, 'Take must be a positive integer')
		.transform((val) => parseInt(val, 10))
		.refine(
			(val) => val >= 1 && val <= 100,
			'Take must be between 1 and 100'
		),
	page: z
		.string()
		.regex(/^\d+$/, 'Page must be a positive integer')
		.transform((val) => parseInt(val, 10))
		.refine((val) => val >= 0, 'Page must be 0 or greater'),
});

// Goal validation schemas
export const createGoalSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(200, 'Title cannot exceed 200 characters')
		.trim(),
	description: z
		.string()
		.max(1000, 'Description cannot exceed 1000 characters')
		.trim()
		.optional()
		.nullable(),
	targetAmount: z
		.number()
		.min(1, 'Target amount must be at least 1')
		.max(1000000, 'Target amount cannot exceed 1,000,000')
		.finite('Target amount must be a valid number'),
	deadline: z
		.string()
		.datetime('Invalid date format')
		.optional()
		.nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

// Post validation schemas (for public endpoints)
export const postQuerySchema = z.object({
	take: z
		.string()
		.regex(/^\d+$/, 'Take must be a positive integer')
		.transform((val) => parseInt(val, 10))
		.refine(
			(val) => val >= 1 && val <= 50,
			'Take must be between 1 and 50'
		),
	page: z
		.string()
		.regex(/^\d+$/, 'Page must be a positive integer')
		.transform((val) => parseInt(val, 10))
		.refine((val) => val >= 0, 'Page must be 0 or greater'),
	tag: z
		.string()
		.max(50, 'Tag cannot exceed 50 characters')
		.trim()
		.optional(),
});

// Rate limiting schema
export const rateLimitByIpSchema = z.object({
	ip: z.string().min(1, 'IP address is required'),
	endpoint: z.string().min(1, 'Endpoint is required'),
	windowMs: z
		.number()
		.min(1000, 'Window must be at least 1 second'),
	maxRequests: z
		.number()
		.min(1, 'Max requests must be at least 1'),
});

// Sanitization helper
export function sanitizeHtml(input: string): string {
	return input
		.replace(/[<>]/g, '') // Remove basic HTML tags
		.replace(/javascript:/gi, '') // Remove javascript: URLs
		.replace(/on\w+\s*=/gi, '') // Remove event handlers
		.trim();
}

// Validation error response helper
export function createValidationErrorResponse(
	error: ZodError<any>
) {
	const errors = error.issues.map((err) => ({
		field: err.path.join('.'),
		message: err.message,
	}));

	return {
		error: 'Validation failed',
		details: errors,
	};
}
