import axios, { AxiosInstance } from 'axios';
import { getLaravelApiBaseUrl } from './config';

/**
 * Laravel API Client - DRY Approach
 *
 * Automatically handles /api/v1 prefix, so you can use clean endpoint paths:
 * ✅ laravelApi.get('vendors/slug/dashboard')
 * ❌ laravelApi.get('/api/v1/vendors/slug/dashboard')
 *
 * The baseURL (from config) already includes /api/v1, so endpoints should be relative.
 */
class LaravelApiClient {
  private client: AxiosInstance;

  constructor(accessToken?: string) {
    this.client = axios.create({
      baseURL: getLaravelApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });
  }

  /**
   * Normalize URL by removing /api/v1 prefix if present
   * This allows both old and new styles to work during migration
   */
  private normalizeUrl(url: string): string {
    // Remove leading slash
    let normalized = url.startsWith('/') ? url.slice(1) : url;

    // Remove /api/v1 prefix if present (for backward compatibility during migration)
    if (normalized.startsWith('api/v1/')) {
      normalized = normalized.slice(7); // Remove 'api/v1/'
    }

    return normalized;
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get(this.normalizeUrl(url));
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    // For FormData, we need to override the default headers to let axios set the boundary
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined, // Let axios set multipart/form-data with boundary
      },
    } : undefined;

    const response = await this.client.post(this.normalizeUrl(url), data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put(this.normalizeUrl(url), data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(this.normalizeUrl(url));
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch(this.normalizeUrl(url), data);
    return response.data;
  }
}

export const createLaravelClient = (accessToken?: string) =>
  new LaravelApiClient(accessToken);

// Default instance for use in onboarding and other flows
export const laravelApi = createLaravelClient();
