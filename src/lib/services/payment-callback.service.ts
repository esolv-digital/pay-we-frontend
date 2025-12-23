/**
 * Wipay Callback Response
 */
export interface WipayCallbackResponse {
  success: boolean;
  status: string;
  message?: string;
  data?: {
    reference?: string;
    transaction_id?: string;
  };
}

/**
 * Payment Callback Service
 *
 * SOLID Principles:
 * - Single Responsibility: Handle payment gateway callbacks
 * - Open/Closed: Open for extension (can add new gateway methods), closed for modification
 * - Liskov Substitution: Can be substituted with mock implementations for testing
 * - Interface Segregation: Provides focused callback processing interface
 * - Dependency Inversion: Depends on BFF API abstraction
 *
 * DRY: Centralizes all payment callback processing logic
 */
export class PaymentCallbackService {
  /**
   * Process Wipay callback parameters
   * Calls BFF API route which forwards to Laravel backend for validation and processing
   *
   * @param callbackParams - URLSearchParams containing Wipay callback data
   * @returns WipayCallbackResponse from backend
   * @throws Error if backend processing fails
   */
  async processWipayCallback(callbackParams: URLSearchParams): Promise<WipayCallbackResponse> {
    const queryString = callbackParams.toString();

    if (process.env.NODE_ENV === 'development') {
      console.log('[PaymentCallbackService] Processing Wipay callback:', Object.fromEntries(callbackParams));
    }

    try {
      // Call BFF API route which proxies to Laravel backend
      const response = await fetch(`/api/webhooks/wipay/callback?${queryString}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`BFF API returned ${response.status}`);
      }

      const result = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('[PaymentCallbackService] Backend response:', result);
      }

      return result;
    } catch (error) {
      console.error('[PaymentCallbackService] Error processing Wipay callback:', error);
      throw error;
    }
  }

  /**
   * Extract transaction reference from callback response
   * Normalizes the reference field from different gateway responses
   *
   * @param response - Callback response from backend
   * @returns Transaction reference string
   */
  extractTransactionReference(response: WipayCallbackResponse): string | null {
    return response.data?.reference || response.data?.transaction_id || null;
  }
}

// Export singleton instance
export const paymentCallbackService = new PaymentCallbackService();
