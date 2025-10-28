import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError, ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api', // Next.js API routes
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies
    });

    this.setupInterceptors();
  }

  private clearAuthAndRedirect() {
    if (typeof window === 'undefined') return;

    // Clear localStorage (auth store is persisted here)
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear cookies by calling logout endpoint
    // This will be a fire-and-forget call
    this.client.post('/auth/logout').catch(() => {
      // Ignore errors - we're logging out anyway
    });

    // Redirect to login
    console.log('[API Client] Redirecting to login page...');
    window.location.href = '/login';
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Token is managed via HTTP-only cookies
        // No need to manually attach it
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle token refresh on 401, but skip for auth endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        const isPublicRoute = typeof window !== 'undefined' &&
          (window.location.pathname === '/login' ||
           window.location.pathname === '/register' ||
           window.location.pathname === '/');

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Skip refresh attempt for auth endpoints
          if (isAuthEndpoint || isPublicRoute) {
            return Promise.reject(error);
          }

          try {
            // Try to refresh the token
            await this.client.post('/auth/refresh');
            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clean up and redirect
            console.log('[API Client] Token refresh failed. Cleaning up and redirecting to login...');
            this.clearAuthAndRedirect();
            return Promise.reject(refreshError);
          }
        }

        // If we get a 401 and already retried, clean up and redirect
        if (error.response?.status === 401 && originalRequest._retry) {
          console.log('[API Client] 401 after retry. Cleaning up and redirecting to login...');
          this.clearAuthAndRedirect();
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
