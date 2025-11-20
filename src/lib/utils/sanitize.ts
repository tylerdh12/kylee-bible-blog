import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * This function removes malicious scripts and unsafe HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
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
  })
}

/**
 * Sanitize plain text input (for comments, names, etc.)
 * Removes all HTML tags and potentially dangerous content
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep the text content
  }).trim()
}

/**
 * Sanitize user input for prayer requests, donation messages, etc.
 * Allows basic text but no HTML
 */
export function sanitizeUserInput(input: string): string {
  return sanitizeText(input)
}
