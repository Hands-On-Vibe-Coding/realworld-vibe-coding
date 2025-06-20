// User types
export interface User {
  id: number;
  email: string;
  username: string;
  bio: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

// Article types
export interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

// Comment types
export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Profile;
}

export interface CommentsResponse {
  comments: Comment[];
}

// API Request types
export interface LoginRequest {
  user: {
    email: string;
    password: string;
  };
}

export interface RegisterRequest {
  user: {
    email: string;
    username: string;
    password: string;
  };
}

export interface CreateArticleRequest {
  article: {
    title: string;
    description: string;
    body: string;
    tagList: string[];
  };
}

export interface UpdateArticleRequest {
  article: {
    title?: string;
    description?: string;
    body?: string;
    tagList?: string[];
  };
}

// Article query parameters
export interface ArticleParams {
  limit?: number;
  offset?: number;
  tag?: string;
  author?: string;
  favorited?: string;
}

export interface FeedParams {
  limit?: number;
  offset?: number;
}

export interface CreateCommentRequest {
  comment: {
    body: string;
  };
}

// API Response wrappers
export interface UserResponseWrapper {
  user: UserResponse;
}

export interface ArticleResponseWrapper {
  article: Article;
}

export interface CommentResponseWrapper {
  comment: Comment;
}

export interface ProfileResponseWrapper {
  profile: Profile;
}

export interface TagsResponse {
  tags: string[];
}