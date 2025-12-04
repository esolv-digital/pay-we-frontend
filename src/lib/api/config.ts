/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

export const API_CONFIG = {
  /**
   * Laravel backend base URL (without /api/v1)
   */
  LARAVEL_BASE_URL: process.env.LARAVEL_API_URL || 'http://localhost:8000',

  /**
   * API version to use (can be changed globally)
   * Set to null or empty string to disable versioning
   */
  API_VERSION: 'v1',

  /**
   * Whether to include /api prefix in Laravel requests
   */
  USE_API_PREFIX: true,
} as const;

/**
 * Build the full Laravel API base URL with version
 * Examples:
 * - With version: http://localhost:8000/api/v1
 * - Without version: http://localhost:8000/api
 * - No api prefix: http://localhost:8000
 */
export function getLaravelApiBaseUrl(): string {
  const parts = [API_CONFIG.LARAVEL_BASE_URL];

  if (API_CONFIG.USE_API_PREFIX) {
    parts.push('api');
  }

  if (API_CONFIG.API_VERSION) {
    parts.push(API_CONFIG.API_VERSION);
  }

  return parts.join('/');
}

/**
 * Build an API endpoint URL
 * @param endpoint - The endpoint path (e.g., '/countries', '/currencies/convert')
 * @param version - Optional version override (e.g., 'v2'), or null to use no version
 */
export function buildApiUrl(endpoint: string, version?: string | null): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // If version is explicitly provided (including null), use it
  if (version !== undefined) {
    const parts = [API_CONFIG.LARAVEL_BASE_URL];

    if (API_CONFIG.USE_API_PREFIX) {
      parts.push('api');
    }

    if (version) {
      parts.push(version);
    }

    parts.push(cleanEndpoint);
    return parts.join('/');
  }

  // Otherwise use the default version
  return `${getLaravelApiBaseUrl()}/${cleanEndpoint}`;
}
