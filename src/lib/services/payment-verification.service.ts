import { publicApi } from '@/lib/api/public';
import type { Transaction } from '@/types';

/**
 * Payment Verification Configuration
 * Single Responsibility: Define verification polling configuration
 */
export interface PaymentVerificationConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Payment Verification Status
 */
export type PaymentStatus = 'pending' | 'completed' | 'success' | 'failed' | 'cancelled' | 'incomplete' | 'error';

/**
 * Payment Verification Result
 */
export interface PaymentVerificationResult {
  transaction: Transaction | null;
  status: PaymentStatus;
  attempts: number;
  error?: Error;
}

/**
 * Payment Verification Service
 *
 * Single Responsibility: Handle payment verification with exponential backoff polling
 * Open/Closed: Open for extension (can add new verification strategies), closed for modification
 * Liskov Substitution: Can be substituted with mock implementations for testing
 * Interface Segregation: Provides focused verification interface
 * Dependency Inversion: Depends on publicApi abstraction
 *
 * DRY: Centralizes all payment verification logic
 */
export class PaymentVerificationService {
  private config: PaymentVerificationConfig;

  constructor(config?: Partial<PaymentVerificationConfig>) {
    // Default configuration
    this.config = {
      maxAttempts: config?.maxAttempts ?? 30, // Poll for up to 30 attempts
      initialDelayMs: config?.initialDelayMs ?? 2000, // Start with 2 seconds
      maxDelayMs: config?.maxDelayMs ?? 10000, // Max 10 seconds between attempts
      backoffMultiplier: config?.backoffMultiplier ?? 1.5, // Exponential backoff
    };
  }

  /**
   * Verify payment with exponential backoff polling
   * Continues polling while transaction is pending
   *
   * @param reference - Transaction reference
   * @param onProgress - Callback for progress updates (optional)
   * @returns PaymentVerificationResult
   */
  async verifyPayment(
    reference: string,
    onProgress?: (attempt: number, maxAttempts: number, nextDelay: number) => void
  ): Promise<PaymentVerificationResult> {
    let attempts = 0;
    let currentDelay = this.config.initialDelayMs;

    while (attempts < this.config.maxAttempts) {
      attempts++;

      try {
        const transaction = await publicApi.verifyTransaction(reference);
        const status = this.normalizeStatus(transaction.status);

        // Call progress callback
        if (onProgress) {
          onProgress(attempts, this.config.maxAttempts, currentDelay);
        }

        // If transaction is completed or failed, return immediately
        if (this.isTerminalStatus(status)) {
          return {
            transaction,
            status,
            attempts,
          };
        }

        // If still pending, wait before next attempt
        if (attempts < this.config.maxAttempts) {
          await this.delay(currentDelay);
          // Increase delay for next attempt (exponential backoff)
          currentDelay = Math.min(
            currentDelay * this.config.backoffMultiplier,
            this.config.maxDelayMs
          );
        }
      } catch (error) {
        // On error, wait and retry
        if (attempts < this.config.maxAttempts) {
          await this.delay(currentDelay);
          currentDelay = Math.min(
            currentDelay * this.config.backoffMultiplier,
            this.config.maxDelayMs
          );
        } else {
          // Max attempts reached, return error
          return {
            transaction: null,
            status: 'pending',
            attempts,
            error: error as Error,
          };
        }
      }
    }

    // Max attempts reached, but transaction still pending
    return {
      transaction: null,
      status: 'pending',
      attempts,
    };
  }

  /**
   * Verify payment with single attempt (no polling)
   * Useful for manual verification requests
   *
   * @param reference - Transaction reference
   * @returns PaymentVerificationResult
   */
  async verifySingleAttempt(reference: string): Promise<PaymentVerificationResult> {
    try {
      const transaction = await publicApi.verifyTransaction(reference);
      const status = this.normalizeStatus(transaction.status);

      return {
        transaction,
        status,
        attempts: 1,
      };
    } catch (error) {
      return {
        transaction: null,
        status: 'pending',
        attempts: 1,
        error: error as Error,
      };
    }
  }

  /**
   * Check if status is terminal (no further polling needed)
   */
  private isTerminalStatus(status: PaymentStatus): boolean {
    return status === 'completed' || status === 'success' || status === 'failed' || status === 'cancelled' || status === 'incomplete' || status === 'error';
  }

  /**
   * Normalize transaction status to standard PaymentStatus
   */
  private normalizeStatus(status: string): PaymentStatus {
    const normalized = status.toLowerCase();

    if (normalized === 'completed' || normalized === 'success') {
      return 'success';
    }

    if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'incomplete' || normalized === 'error') {
      return 'failed';
    }

    return 'pending';
  }

  /**
   * Delay helper using Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate estimated time remaining (in seconds)
   */
  calculateEstimatedTime(currentAttempt: number, currentDelay: number): number {
    let totalTime = 0;
    let delay = currentDelay;

    for (let i = currentAttempt; i < this.config.maxAttempts; i++) {
      totalTime += delay;
      delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelayMs);
    }

    return Math.ceil(totalTime / 1000); // Convert to seconds
  }
}

// Export singleton instance with default config
export const paymentVerificationService = new PaymentVerificationService();
