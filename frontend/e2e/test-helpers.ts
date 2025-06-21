import { expect, Page } from '@playwright/test'

export class TestUser {
  constructor(
    public email: string,
    public username: string,
    public password: string,
    public bio?: string
  ) {}
}

export const testUsers = {
  user1: new TestUser(
    'user1@example.com',
    'testuser1',
    'password123',
    'I am a test user'
  ),
  user2: new TestUser(
    'user2@example.com',
    'testuser2',
    'password123',
    'Another test user'
  ),
}

export const testArticle = {
  title: 'E2E Test Article',
  description: 'This is a test article for E2E testing',
  body: 'This is the body of the test article. It contains multiple paragraphs to test the article display functionality.',
  tags: ['e2e', 'testing', 'playwright']
}

/**
 * Authentication helpers
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async register(user: TestUser) {
    await this.page.goto('/register')
    
    await this.page.fill('[data-testid="username-input"]', user.username)
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    
    await this.page.click('[data-testid="register-button"]')
    
    // Wait for successful registration (redirect to home)
    await this.page.waitForURL('/')
    
    // Verify user is logged in
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible()
  }

  async login(user: TestUser) {
    await this.page.goto('/login')
    
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    
    await this.page.click('[data-testid="login-button"]')
    
    // Wait for successful login (redirect to home)
    await this.page.waitForURL('/')
    
    // Verify user is logged in
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible()
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
    
    // Verify user is logged out
    await expect(this.page.locator('[data-testid="login-link"]')).toBeVisible()
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 1000 })
      return true
    } catch {
      return false
    }
  }
}

/**
 * Article helpers
 */
export class ArticleHelper {
  constructor(private page: Page) {}

  async createArticle(article: typeof testArticle) {
    await this.page.goto('/editor')
    
    await this.page.fill('[data-testid="title-input"]', article.title)
    await this.page.fill('[data-testid="description-input"]', article.description)
    await this.page.fill('[data-testid="body-input"]', article.body)
    
    // Add tags
    for (const tag of article.tags) {
      await this.page.fill('[data-testid="tags-input"]', tag)
      await this.page.keyboard.press('Enter')
    }
    
    await this.page.click('[data-testid="publish-button"]')
    
    // Wait for article to be created and redirected to article page
    await this.page.waitForURL(/\/article\//)
  }

  async deleteArticle(articleSlug: string) {
    await this.page.goto(`/article/${articleSlug}`)
    
    await this.page.click('[data-testid="delete-article-button"]')
    
    // Confirm deletion if there's a confirmation dialog
    await this.page.click('[data-testid="confirm-delete-button"]')
    
    // Wait for redirect to home
    await this.page.waitForURL('/')
  }

  async favoriteArticle() {
    await this.page.click('[data-testid="favorite-button"]')
    
    // Wait for the favorite count to update
    await this.page.waitForTimeout(500)
  }

  async unfavoriteArticle() {
    await this.page.click('[data-testid="unfavorite-button"]')
    
    // Wait for the favorite count to update
    await this.page.waitForTimeout(500)
  }
}

/**
 * Comment helpers
 */
export class CommentHelper {
  constructor(private page: Page) {}

  async addComment(body: string) {
    await this.page.fill('[data-testid="comment-input"]', body)
    await this.page.click('[data-testid="post-comment-button"]')
    
    // Wait for comment to appear
    await this.page.waitForSelector(`text=${body}`)
  }

  async deleteComment(commentId: string) {
    await this.page.click(`[data-testid="delete-comment-${commentId}"]`)
    
    // Wait for comment to disappear
    await this.page.waitForSelector(`[data-testid="comment-${commentId}"]`, { state: 'detached' })
  }
}

/**
 * Profile helpers
 */
export class ProfileHelper {
  constructor(private page: Page) {}

  async followUser(username: string) {
    await this.page.goto(`/profile/${username}`)
    
    await this.page.click('[data-testid="follow-button"]')
    
    // Wait for button to change to "unfollow"
    await expect(this.page.locator('[data-testid="unfollow-button"]')).toBeVisible()
  }

  async unfollowUser(username: string) {
    await this.page.goto(`/profile/${username}`)
    
    await this.page.click('[data-testid="unfollow-button"]')
    
    // Wait for button to change to "follow"
    await expect(this.page.locator('[data-testid="follow-button"]')).toBeVisible()
  }

  async updateProfile(bio: string, image?: string) {
    await this.page.goto('/settings')
    
    if (image) {
      await this.page.fill('[data-testid="image-input"]', image)
    }
    
    await this.page.fill('[data-testid="bio-input"]', bio)
    
    await this.page.click('[data-testid="update-profile-button"]')
    
    // Wait for profile to update
    await this.page.waitForSelector(`text=${bio}`)
  }
}

/**
 * Navigation helpers
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto('/')
  }

  async goToGlobalFeed() {
    await this.page.goto('/')
    await this.page.click('[data-testid="global-feed-tab"]')
  }

  async goToYourFeed() {
    await this.page.goto('/')
    await this.page.click('[data-testid="your-feed-tab"]')
  }

  async goToTagFeed(tag: string) {
    await this.page.goto('/')
    await this.page.click(`[data-testid="tag-${tag}"]`)
  }

  async searchArticles(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.keyboard.press('Enter')
  }
}

/**
 * Wait helpers
 */
export class WaitHelper {
  constructor(private page: Page) {}

  async waitForArticleToLoad() {
    await this.page.waitForSelector('[data-testid="article-content"]')
  }

  async waitForCommentsToLoad() {
    await this.page.waitForSelector('[data-testid="comments-section"]')
  }

  async waitForProfileToLoad() {
    await this.page.waitForSelector('[data-testid="profile-info"]')
  }

  async waitForFeedToLoad() {
    await this.page.waitForSelector('[data-testid="article-list"]')
  }
}

/**
 * Create all helpers for a page
 */
export function createHelpers(page: Page) {
  return {
    auth: new AuthHelper(page),
    article: new ArticleHelper(page),
    comment: new CommentHelper(page),
    profile: new ProfileHelper(page),
    navigation: new NavigationHelper(page),
    wait: new WaitHelper(page),
  }
}