import axios, { AxiosInstance } from 'axios';

class LaravelApiClient {
  private client: AxiosInstance;

  constructor(accessToken?: string) {
    this.client = axios.create({
      baseURL: process.env.LARAVEL_API_URL || 'http://localhost:8000',
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
    // Let axios handle Content-Type for FormData automatically
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
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
