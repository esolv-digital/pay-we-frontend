import axios, { AxiosInstance } from 'axios';
import { getLaravelApiBaseUrl } from './config';

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

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    // For FormData, we need to override the default headers to let axios set the boundary
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined, // Let axios set multipart/form-data with boundary
      },
    } : undefined;

    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch(url, data);
    return response.data;
  }
}

export const createLaravelClient = (accessToken?: string) =>
  new LaravelApiClient(accessToken);
