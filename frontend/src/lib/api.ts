import type {
  LoginRequest,
  RegisterRequest,
  UserResponseWrapper,
  ArticlesResponse,
  ArticleResponseWrapper,
  CreateArticleRequest,
  CommentsResponse,
  CreateCommentRequest,
  CommentResponseWrapper,
  ProfileResponseWrapper,
  TagsResponse,
} from '@/types';

export class ApiClient {
  private baseURL = '/api';
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
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
  async getArticles(params?: {
    limit?: number;
    offset?: number;
    tag?: string;
    author?: string;
    favorited?: string;
  }): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.author) searchParams.set('author', params.author);
    if (params?.favorited) searchParams.set('favorited', params.favorited);

    const query = searchParams.toString();
    return this.request(`/articles${query ? `?${query}` : ''}`);
  }

  async getFeed(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ArticlesResponse> {
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

  // Profile endpoints
  async getProfile(username: string): Promise<ProfileResponseWrapper> {
    return this.request(`/profiles/${username}`);
  }

  // Tags endpoints
  async getTags(): Promise<TagsResponse> {
    return this.request('/tags');
  }
}

export const api = new ApiClient();