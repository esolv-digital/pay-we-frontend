/**
 * Test Configuration Helper
 *
 * Provides access to test environment variables from .env.testing
 * Used for E2E tests with real API calls
 */

export const testConfig = {
  /**
   * Backend API URL
   */
  apiUrl: process.env.LARAVEL_API_URL || 'http://localhost:8000',

  /**
   * Test user credentials
   * These should be dedicated test accounts on staging/test environment
   */
  user: {
    email: process.env.TEST_USER_EMAIL || 'john.doe+1@example.com',
    password: process.env.TEST_USER_PASSWORD || 'SecurePassword123!',
  },

  /**
   * Test organization data
   */
  organization: {
    name: process.env.TEST_ORG_NAME || 'Test Organization Ltd',
    country: process.env.TEST_ORG_COUNTRY || 'GH',
  },

  /**
   * API configuration
   */
  api: {
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    callDelay: parseInt(process.env.API_CALL_DELAY_MS || '100', 10),
  },

  /**
   * Error logging configuration
   */
  logging: {
    enabled: process.env.ENABLE_TEST_ERROR_LOGGING === 'true',
    directory: process.env.TEST_ERROR_LOG_DIR || './logs/e2e-tests',
  },

  /**
   * Test behavior flags
   */
  behavior: {
    headless: process.env.HEADLESS !== 'false',
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE === 'true',
    recordVideo: process.env.RECORD_VIDEO === 'true',
  },

  /**
   * Test data cleanup
   */
  cleanup: {
    enabled: process.env.CLEANUP_TEST_DATA === 'true',
    prefix: process.env.TEST_DATA_PREFIX || 'e2e_test_',
  },
};

/**
 * Helper to add delay between API calls to avoid rate limiting
 */
export async function apiDelay(): Promise<void> {
  if (testConfig.api.callDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, testConfig.api.callDelay));
  }
}

/**
 * Generate unique test data identifier
 */
export function generateTestId(): string {
  return `${testConfig.cleanup.prefix}${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return !!process.env.CI;
}

/**
 * Get base URL for frontend
 */
export function getBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:3000';
}
