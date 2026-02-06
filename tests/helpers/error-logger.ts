/**
 * E2E Test Error Logger
 *
 * Logs API errors to date-specific files for tracking and debugging.
 * This helps identify backend API bugs and missing endpoints.
 *
 * Usage:
 *   import { logApiError, logTestError } from './helpers/error-logger';
 *
 *   try {
 *     await apiCall();
 *   } catch (error) {
 *     await logApiError('GET /api/v1/vendors/slug/dashboard', error);
 *     throw error;
 *   }
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration from .env.testing
const ERROR_LOG_DIR = process.env.TEST_ERROR_LOG_DIR || './logs/e2e-tests';
const ENABLE_LOGGING = process.env.ENABLE_TEST_ERROR_LOGGING !== 'false';

/**
 * Ensure log directory exists
 */
function ensureLogDirectory(): string {
  const logDir = path.resolve(process.cwd(), ERROR_LOG_DIR);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return logDir;
}

/**
 * Get log file path for current date
 */
function getLogFilePath(prefix: string = 'api-errors'): string {
  const logDir = ensureLogDirectory();
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logDir, `${prefix}-${date}.log`);
}

/**
 * Format log entry with timestamp
 */
function formatLogEntry(
  endpoint: string,
  error: any,
  context?: Record<string, any>
): string {
  const timestamp = new Date().toISOString();
  const separator = '='.repeat(80);

  let logEntry = `\n${separator}\n`;
  logEntry += `[${timestamp}] API Error\n`;
  logEntry += `${separator}\n`;
  logEntry += `Endpoint: ${endpoint}\n`;

  // Error details
  if (error.response) {
    // API response error
    logEntry += `Status: ${error.response.status} ${error.response.statusText}\n`;
    logEntry += `Response Data:\n${JSON.stringify(error.response.data, null, 2)}\n`;
  } else if (error.request) {
    // Request made but no response
    logEntry += `Error: No response received\n`;
    logEntry += `Request:\n${JSON.stringify(error.request, null, 2)}\n`;
  } else {
    // Other error
    logEntry += `Error Message: ${error.message}\n`;
    logEntry += `Stack Trace:\n${error.stack}\n`;
  }

  // Additional context
  if (context) {
    logEntry += `Context:\n${JSON.stringify(context, null, 2)}\n`;
  }

  logEntry += `${separator}\n`;

  return logEntry;
}

/**
 * Log API error to file
 *
 * @param endpoint - The API endpoint that failed (e.g., 'GET /api/v1/vendors/slug/dashboard')
 * @param error - The error object
 * @param context - Optional context (test name, request data, etc.)
 */
export async function logApiError(
  endpoint: string,
  error: any,
  context?: Record<string, any>
): Promise<void> {
  if (!ENABLE_LOGGING) return;

  try {
    const logFile = getLogFilePath('api-errors');
    const logEntry = formatLogEntry(endpoint, error, context);

    fs.appendFileSync(logFile, logEntry, 'utf8');

    // Also log to console in test environment for immediate feedback
    if (process.env.NODE_ENV === 'test') {
      console.error(`[ERROR LOG] ${endpoint}`, {
        status: error.response?.status,
        message: error.message,
        logFile,
      });
    }
  } catch (logError) {
    // Don't let logging errors break tests
    console.error('Failed to log API error:', logError);
  }
}

/**
 * Log general test error to file
 *
 * @param testName - Name of the test that failed
 * @param error - The error object
 * @param context - Optional context
 */
export async function logTestError(
  testName: string,
  error: any,
  context?: Record<string, any>
): Promise<void> {
  if (!ENABLE_LOGGING) return;

  try {
    const logFile = getLogFilePath('test-errors');
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);

    let logEntry = `\n${separator}\n`;
    logEntry += `[${timestamp}] Test Failure\n`;
    logEntry += `${separator}\n`;
    logEntry += `Test: ${testName}\n`;
    logEntry += `Error: ${error.message}\n`;
    logEntry += `Stack:\n${error.stack}\n`;

    if (context) {
      logEntry += `Context:\n${JSON.stringify(context, null, 2)}\n`;
    }

    logEntry += `${separator}\n`;

    fs.appendFileSync(logFile, logEntry, 'utf8');
  } catch (logError) {
    console.error('Failed to log test error:', logError);
  }
}

/**
 * Log missing API endpoint (when backend returns 404)
 *
 * @param endpoint - The missing endpoint
 * @param expectedBehavior - What the endpoint should do
 * @param context - Optional context
 */
export async function logMissingEndpoint(
  endpoint: string,
  expectedBehavior: string,
  context?: Record<string, any>
): Promise<void> {
  if (!ENABLE_LOGGING) return;

  try {
    const logFile = getLogFilePath('missing-endpoints');
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);

    let logEntry = `\n${separator}\n`;
    logEntry += `[${timestamp}] Missing Endpoint\n`;
    logEntry += `${separator}\n`;
    logEntry += `Endpoint: ${endpoint}\n`;
    logEntry += `Expected Behavior: ${expectedBehavior}\n`;

    if (context) {
      logEntry += `Context:\n${JSON.stringify(context, null, 2)}\n`;
    }

    logEntry += `${separator}\n`;

    fs.appendFileSync(logFile, logEntry, 'utf8');

    console.warn(`[MISSING ENDPOINT] ${endpoint} - ${expectedBehavior}`);
  } catch (logError) {
    console.error('Failed to log missing endpoint:', logError);
  }
}

/**
 * Create a summary report of all errors for a given date
 *
 * @param date - Date to create summary for (defaults to today)
 */
export async function createErrorSummary(date?: string): Promise<string> {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const logDir = ensureLogDirectory();

  const summaryFile = path.join(logDir, `summary-${targetDate}.md`);
  const apiErrorsFile = path.join(logDir, `api-errors-${targetDate}.log`);
  const missingEndpointsFile = path.join(logDir, `missing-endpoints-${targetDate}.log`);

  let summary = `# E2E Test Error Summary - ${targetDate}\n\n`;
  summary += `Generated at: ${new Date().toISOString()}\n\n`;
  summary += `---\n\n`;

  // API Errors
  summary += `## API Errors\n\n`;
  if (fs.existsSync(apiErrorsFile)) {
    const content = fs.readFileSync(apiErrorsFile, 'utf8');
    const errorCount = (content.match(/API Error/g) || []).length;
    summary += `**Total API Errors:** ${errorCount}\n\n`;
    summary += `See detailed log: [api-errors-${targetDate}.log](./api-errors-${targetDate}.log)\n\n`;
  } else {
    summary += `No API errors logged for this date.\n\n`;
  }

  // Missing Endpoints
  summary += `## Missing Endpoints\n\n`;
  if (fs.existsSync(missingEndpointsFile)) {
    const content = fs.readFileSync(missingEndpointsFile, 'utf8');
    const missingCount = (content.match(/Missing Endpoint/g) || []).length;
    summary += `**Total Missing Endpoints:** ${missingCount}\n\n`;

    // Extract unique missing endpoints
    const endpoints = new Set<string>();
    const matches = content.matchAll(/Endpoint: (.+)/g);
    for (const match of matches) {
      endpoints.add(match[1]);
    }

    if (endpoints.size > 0) {
      summary += `**Unique Missing Endpoints:**\n`;
      endpoints.forEach((endpoint) => {
        summary += `- ${endpoint}\n`;
      });
      summary += `\n`;
    }

    summary += `See detailed log: [missing-endpoints-${targetDate}.log](./missing-endpoints-${targetDate}.log)\n\n`;
  } else {
    summary += `No missing endpoints logged for this date.\n\n`;
  }

  // Write summary
  fs.writeFileSync(summaryFile, summary, 'utf8');

  console.log(`Error summary created: ${summaryFile}`);
  return summaryFile;
}

/**
 * Clear old log files (older than specified days)
 *
 * @param daysToKeep - Number of days of logs to keep (default: 30)
 */
export async function cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
  const logDir = ensureLogDirectory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const files = fs.readdirSync(logDir);

  for (const file of files) {
    const filePath = path.join(logDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  }
}
