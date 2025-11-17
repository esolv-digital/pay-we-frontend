import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiError } from '@/types';

/**
 * Extract error message and validation errors from API error response
 * Following SOLID principles - Single Responsibility: handles only error extraction
 */
export function extractApiError(error: unknown): {
  message: string;
  errors: Record<string, string[]>;
} {
  // Type guard for AxiosError
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;

    // Extract message and validation errors from API response
    const message = apiError?.message || error.message || 'An unexpected error occurred';
    const errors = apiError?.errors || {};

    return { message, errors };
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      errors: {},
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred',
    errors: {},
  };
}

/**
 * Display API error using toast notifications
 * Following SOLID principles:
 * - Single Responsibility: handles only error display
 * - Dependency Inversion: depends on toast abstraction, not concrete implementation
 */
export function showApiError(error: unknown): void {
  const { message, errors } = extractApiError(error);

  // Show main error message
  toast.error(message, {
    duration: 5000,
  });

  // Show validation errors if present
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach((msg) => {
        toast.error(`${field}: ${msg}`, {
          duration: 5000,
        });
      });
    });
  }
}

/**
 * Display success message using toast notifications
 * Following DRY principle - centralized success message display
 */
export function showSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
  });
}

/**
 * Display info message using toast notifications
 */
export function showInfo(message: string): void {
  toast.info(message, {
    duration: 3000,
  });
}

/**
 * Display warning message using toast notifications
 */
export function showWarning(message: string): void {
  toast.warning(message, {
    duration: 4000,
  });
}
