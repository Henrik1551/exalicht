/**
 * Strip HTML tags from a string and return plain text
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // Create a temporary DOM element to parse HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Get text content and clean up whitespace
  let text = doc.body.textContent || '';
  
  // Clean up excessive whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract a clean summary from HTML content
 */
export function extractSummary(html: string | null | undefined, maxLength: number = 150): string {
  const plainText = stripHtml(html);
  return truncateText(plainText, maxLength);
}
