import { User, AuthResponse, ApiError } from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('ums_token');
  }

  private getHeaders(customToken?: string | null): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = customToken !== undefined ? customToken : this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorObj: ApiError = typeof data === 'object' && data !== null && 'message' in data
        ? (data as ApiError)
        : {
            timestamp: new Date().toISOString(),
            status: res.status,
            error: res.statusText || 'Error',
            message: typeof data === 'string' ? data : (data as any)?.message || 'An error occurred',
          };
      throw errorObj;
    }

    return data as T;
  }

  async register(name: string, email: string, password: string): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return this.handleResponse<{ message: string; user: User }>(res);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async getUsers(overrideToken?: string | null): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: this.getHeaders(overrideToken),
    });
    return this.handleResponse<User[]>(res);
  }

  async addUser(
    userData: { name: string; email: string; password: string },
    overrideToken?: string | null
  ): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: this.getHeaders(overrideToken),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(res);
  }

  async deleteUser(id: number, overrideToken?: string | null): Promise<{ message: string; deletedUserId?: number }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(overrideToken),
    });
    return this.handleResponse<{ message: string; deletedUserId?: number }>(res);
  }
}

export const api = new ApiClient();
