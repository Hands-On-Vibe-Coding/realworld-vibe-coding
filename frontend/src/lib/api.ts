import type {
  LoginRequest,
  RegisterRequest,
  UserResponseWrapper,
  ArticlesResponse,
  ArticleResponseWrapper,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleParams,
  FeedParams,
  CommentsResponse,
  CreateCommentRequest,
  CommentResponseWrapper,
  ProfileResponseWrapper,
  TagsResponse,
} from '@/types';
import { notifications } from '@mantine/notifications';

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onTokenExpired?: () => void;

  constructor() {
    // Set API base URL based on environment
    if (typeof window !== 'undefined') {
      // Browser environment
      if (window.location.hostname === 'localhost') {
        // Development environment - use Vite proxy
        this.baseURL = '/api';
      } else {
        // Production environment - use deployed backend
        this.baseURL = process.env.VITE_API_BASE_URL 
          ? `${process.env.VITE_API_BASE_URL}/api`
          : '/api';
      }
    } else {
      // Server-side rendering fallback
      this.baseURL = '/api';
    }
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setTokenExpiredCallback(callback: () => void) {
    this.onTokenExpired = callback;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check token expiration before making request
    if (this.token && this.isTokenExpired(this.token)) {
      notifications.show({
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        color: 'red',
      });
      this.onTokenExpired?.();
      throw new Error('Token expired');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized (token expired or invalid)
      if (response.status === 401 && this.token) {
        notifications.show({
          title: 'Authentication Failed',
          message: 'Your session is invalid. Please log in again.',
          color: 'red',
        });
        this.onTokenExpired?.();
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Show user-friendly error notifications
        notifications.show({
          title: 'Request Failed',
          message: errorData.error || errorData.message || `HTTP ${response.status}`,
          color: 'red',
        });
        
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Only show notification if it's a network error (not already handled above)
      if (error instanceof TypeError) {
        notifications.show({
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your connection.',
          color: 'red',
        });
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<UserResponseWrapper> {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<UserResponseWrapper> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<UserResponseWrapper> {
    return this.request('/user');
  }

  // Articles endpoints
  async getArticles(params?: ArticleParams): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.author) searchParams.set('author', params.author);
    if (params?.favorited) searchParams.set('favorited', params.favorited);

    const query = searchParams.toString();
    return this.request(`/articles${query ? `?${query}` : ''}`);
  }

  async getFeed(params?: FeedParams): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/articles/feed${query ? `?${query}` : ''}`);
  }

  async getArticle(slug: string): Promise<ArticleResponseWrapper> {
    return this.request(`/articles/${slug}`);
  }

  async createArticle(data: CreateArticleRequest): Promise<ArticleResponseWrapper> {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(slug: string, data: UpdateArticleRequest): Promise<ArticleResponseWrapper> {
    return this.request(`/articles/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(slug: string): Promise<void> {
    return this.request(`/articles/${slug}`, {
      method: 'DELETE',
    });
  }

  // Comments endpoints
  async getComments(slug: string): Promise<CommentsResponse> {
    return this.request(`/articles/${slug}/comments`);
  }

  async createComment(
    slug: string,
    data: CreateCommentRequest
  ): Promise<CommentResponseWrapper> {
    return this.request(`/articles/${slug}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(slug: string, commentId: number): Promise<void> {
    return this.request(`/articles/${slug}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Profile endpoints
  async getProfile(username: string): Promise<ProfileResponseWrapper> {
    return this.request(`/profiles/${username}`);
  }

  async followUser(username: string): Promise<ProfileResponseWrapper> {
    return this.request(`/profiles/${username}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(username: string): Promise<ProfileResponseWrapper> {
    return this.request(`/profiles/${username}/follow`, {
      method: 'DELETE',
    });
  }

  // Tags endpoints
  async getTags(): Promise<TagsResponse> {
    return this.request('/tags');
  }
}

export const api = new ApiClient();