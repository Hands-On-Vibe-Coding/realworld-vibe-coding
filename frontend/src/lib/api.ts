import type {
  UserResponse,
  RegisterRequest,
  LoginRequest,
  UpdateUserRequest,
  ArticlesResponse,
  ArticleResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
  TagsResponse,
  CommentsResponse,
  CommentResponse,
  CreateCommentRequest,
  ProfileResponse,
} from '../types/api';

const API_BASE_URL = 'http://localhost:8081/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Token ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await this.request<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    this.setToken(response.user.token);
    return response;
  }

  async login(data: LoginRequest): Promise<UserResponse> {
    const response = await this.request<UserResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    this.setToken(response.user.token);
    return response;
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/user');
  }

  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    const response = await this.request<UserResponse>('/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Update token
    this.setToken(response.user.token);
    return response;
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Article endpoints
  async getArticles(params?: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.tag) searchParams.append('tag', params.tag);
    if (params?.author) searchParams.append('author', params.author);
    if (params?.favorited) searchParams.append('favorited', params.favorited);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/articles?${queryString}` : '/articles';
    
    return this.request<ArticlesResponse>(url);
  }

  async getFeed(params?: { limit?: number; offset?: number }): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/articles/feed?${queryString}` : '/articles/feed';
    
    return this.request<ArticlesResponse>(url);
  }

  async getArticle(slug: string): Promise<ArticleResponse> {
    return this.request<ArticleResponse>(`/articles/${slug}`);
  }

  async createArticle(data: CreateArticleRequest): Promise<ArticleResponse> {
    return this.request<ArticleResponse>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(slug: string, data: UpdateArticleRequest): Promise<ArticleResponse> {
    return this.request<ArticleResponse>(`/articles/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(slug: string): Promise<void> {
    await this.request(`/articles/${slug}`, {
      method: 'DELETE',
    });
  }

  async favoriteArticle(slug: string): Promise<ArticleResponse> {
    return this.request<ArticleResponse>(`/articles/${slug}/favorite`, {
      method: 'POST',
    });
  }

  async unfavoriteArticle(slug: string): Promise<ArticleResponse> {
    return this.request<ArticleResponse>(`/articles/${slug}/favorite`, {
      method: 'DELETE',
    });
  }

  async getTags(): Promise<TagsResponse> {
    return this.request<TagsResponse>('/tags');
  }

  // Comment endpoints
  async getComments(slug: string): Promise<CommentsResponse> {
    return this.request<CommentsResponse>(`/articles/${slug}/comments`);
  }

  async createComment(slug: string, data: CreateCommentRequest): Promise<CommentResponse> {
    return this.request<CommentResponse>(`/articles/${slug}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(slug: string, id: number): Promise<void> {
    await this.request(`/articles/${slug}/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile endpoints
  async getProfile(username: string): Promise<ProfileResponse> {
    return this.request<ProfileResponse>(`/profiles/${username}`);
  }

  async followUser(username: string): Promise<ProfileResponse> {
    return this.request<ProfileResponse>(`/profiles/${username}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(username: string): Promise<ProfileResponse> {
    return this.request<ProfileResponse>(`/profiles/${username}/follow`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();