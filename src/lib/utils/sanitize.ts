// Use dynamic import for server-side to prevent jsdom from being bundled
// On the client, we use static import since jsdom won't be loaded in the browser

let serverDOMPurify: typeof import('isomorphic-dompurify').default | null = null;
let serverDOMPurifyPromise: Promise<typeof import('isomorphic-dompurify').default> | null = null;

async function getServerDOMPurify(): Promise<typeof import('isomorphic-dompurify').default> {
	if (serverDOMPurify !== null) {
		return serverDOMPurify;
	}
	if (serverDOMPurifyPromise === null) {
		serverDOMPurifyPromise = import('isomorphic-dompurify').then(module => {
			serverDOMPurify = module.default;
			return serverDOMPurify;
		});
	}
	return serverDOMPurifyPromise;
}

// For client-side, use static import (only loaded in browser, no jsdom needed)
const isServer = typeof window === 'undefined';
let clientDOMPurify: typeof import('isomorphic-dompurify').default | null = null;

if (!isServer) {
	// Only import on client side
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		clientDOMPurify = require('isomorphic-dompurify').default;
	} catch {
		// Fallback if require fails
		clientDOMPurify = null;
	}
}

// Create config objects with explicit mutable types
const sanitizeConfig: {
	ALLOWED_TAGS: string[];
	ALLOWED_ATTR: string[];
	ALLOWED_URI_REGEXP: RegExp;
	ADD_ATTR: string[];
	FORBID_TAGS: string[];
	FORBID_ATTR: string[];
} = {
	ALLOWED_TAGS: [
		// Text formatting
		'p', 'br', 'strong', 'em', 'u', 'del', 's', 'mark',
		// Headings
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		// Lists
		'ul', 'ol', 'li',
		// Blockquote
		'blockquote',
		// Links
		'a',
		// Code
		'code', 'pre',
		// Tables (for TipTap editor)
		'table', 'thead', 'tbody', 'tr', 'th', 'td',
		// Spans for styling
		'span',
		// Images (restricted attributes)
		'img',
	],
	ALLOWED_ATTR: [
		'href', 'target', 'rel', // For links
		'class', 'style', // For styling (TipTap uses these)
		'src', 'alt', 'width', 'height', // For images
		'colspan', 'rowspan', // For tables
	],
	// Only allow HTTP and HTTPS URLs
	ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
	// Add target="_blank" and rel="noopener noreferrer" to all links
	ADD_ATTR: ['target', 'rel'],
	FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
	FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

const textSanitizeConfig: {
	ALLOWED_TAGS: string[];
	ALLOWED_ATTR: string[];
	KEEP_CONTENT: boolean;
} = {
	ALLOWED_TAGS: [], // No HTML tags allowed
	ALLOWED_ATTR: [],
	KEEP_CONTENT: true, // Keep the text content
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * This function removes malicious scripts and unsafe HTML
 * 
 * Note: On the server, this returns a Promise. On the client, it's synchronous.
 */
export async function sanitizeHtml(html: string): Promise<string>;
export function sanitizeHtml(html: string): string;
export function sanitizeHtml(html: string): string | Promise<string> {
	if (!html || typeof html !== 'string') {
		return '';
	}

	// Client-side: use static import (synchronous)
	if (!isServer && clientDOMPurify) {
		return clientDOMPurify.sanitize(html, sanitizeConfig);
	}

	// Server-side: use dynamic import (asynchronous)
	if (isServer) {
		return getServerDOMPurify().then(purify => purify.sanitize(html, sanitizeConfig));
	}

	// Fallback (shouldn't happen)
	return html;
}

/**
 * Sanitize plain text input (for comments, names, etc.)
 * Removes all HTML tags and potentially dangerous content
 * 
 * Note: On the server, this returns a Promise. On the client, it's synchronous.
 */
export async function sanitizeText(text: string): Promise<string>;
export function sanitizeText(text: string): string;
export function sanitizeText(text: string): string | Promise<string> {
	if (!text || typeof text !== 'string') {
		return '';
	}

	// Client-side: use static import (synchronous)
	if (!isServer && clientDOMPurify) {
		return clientDOMPurify.sanitize(text, textSanitizeConfig).trim();
	}

	// Server-side: use dynamic import (asynchronous)
	if (isServer) {
		return getServerDOMPurify().then(purify => purify.sanitize(text, textSanitizeConfig).trim());
	}

	// Fallback (shouldn't happen)
	return text.trim();
}

/**
 * Sanitize user input for prayer requests, donation messages, etc.
 * Allows basic text but no HTML
 * 
 * Note: On the server, this returns a Promise. On the client, it's synchronous.
 */
export async function sanitizeUserInput(input: string): Promise<string>;
export function sanitizeUserInput(input: string): string;
export function sanitizeUserInput(input: string): string | Promise<string> {
	return sanitizeText(input);
}

/**
 * Strip HTML tags and get plain text for previews/excerpts
 * Useful for displaying post content in cards without HTML markup
 * 
 * Note: On the server, this returns a Promise. On the client, it's synchronous.
 */
export async function stripHtmlToText(html: string, maxLength?: number): Promise<string>;
export function stripHtmlToText(html: string, maxLength?: number): string;
export function stripHtmlToText(html: string, maxLength?: number): string | Promise<string> {
	if (!html || typeof html !== 'string') {
		return '';
	}

	// Get sanitized text (may be async on server)
	const textResult: string | Promise<string> = sanitizeText(html);
	
	// Helper function to truncate text
	const truncateText = (text: string): string => {
		if (maxLength && text.length > maxLength) {
			let truncated = text.substring(0, maxLength).trim();
			const lastSpace = truncated.lastIndexOf(' ');
			if (lastSpace > maxLength * 0.8) {
				truncated = truncated.substring(0, lastSpace);
			}
			return truncated + '...';
		}
		return text;
	};
	
	// Handle both sync and async results
	if (typeof textResult === 'string') {
		// Client-side (synchronous)
		return truncateText(textResult);
	} else {
		// Server-side (asynchronous)
		return textResult.then(truncateText);
	}
}
