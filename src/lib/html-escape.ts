/**
 * HTML escape utilities for preventing XSS in email templates
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape HTML and convert newlines to <br> tags
 */
export function escapeHtmlWithBreaks(unsafe: string): string {
  return escapeHtml(unsafe).replace(/\n/g, '<br>');
}

/**
 * Sanitize URL to prevent javascript: and other dangerous protocols
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return parsed.href;
  } catch {
    return '#';
  }
}
