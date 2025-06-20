// API Types for RealWorld application

export interface User {
  email: string;
  token: string;
  username: string;
  bio: string | null;
  image: string | null;
}

export interface UserResponse {
  user: User;
}

export interface RegisterRequest {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

export interface LoginRequest {
  user: {
    email: string;
    password: string;
  };
}

export interface UpdateUserRequest {
  user: {
    email?: string;
    username?: string;
    password?: string;
    bio?: string;
    image?: string;
  };
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface Article {
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

export interface ArticleResponse {
  article: Article;
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface TagsResponse {
  tags: string[];
}

export interface CreateArticleRequest {
  article: {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
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