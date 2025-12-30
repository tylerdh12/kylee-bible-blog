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

/**
 * Strip HTML tags and get plain text for previews/excerpts
 * Useful for displaying post content in cards without HTML markup
 */
export function stripHtmlToText(html: string, maxLength?: number): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Use sanitizeText to strip all HTML tags and get plain text
  let text = sanitizeText(html)

  // Truncate if maxLength is provided
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength).trim()
    // Don't cut off in the middle of a word if possible
    const lastSpace = text.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace)
    }
    text += '...'
  }

  return text
}
