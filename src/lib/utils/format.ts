import { format as dateFnsFormat } from 'date-fns';

/**
 * Format currency with proper symbol and decimals
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  // Handle NaN, undefined, or invalid numbers
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(safeAmount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, format: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, format);
}

/**
 * Format date to datetime string
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Format transaction status to readable text
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
