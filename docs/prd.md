# RealWorld Vibe Coding Implementation - PRD (Product Requirements Document)

## 1. Project Overview

### 1.1 Project Objectives
Implement a RealWorld application using Vibe Coding methodology to build a complete full-stack application

### 1.2 Project Scope
- **Frontend**: React + Vite-based SPA
- **Backend**: Go + standard net/http-based REST API
- **Database**: SQLite (development) + PostgreSQL (production)
- **Authentication**: JWT-based user authentication
- **Deployment**: Container deployment via AWS ECS + Fargate

### 1.3 Success Metrics
- 100% compliance with RealWorld API specification
- 80%+ test coverage
- Initial loading time under 3 seconds
- Mobile responsive design support

## 2. Functional Requirements

### 2.1 User Management and Authentication
#### 2.1.1 User Registration
- **Function**: Email, username, password-based registration
- **Validation**: Email duplication check, username duplication check
- **Security**: JWT token issuance

#### 2.1.2 User Login
- **Function**: Login via email/username and password
- **Validation**: Input value validation
- **Security**: JWT token issuance

#### 2.1.3 Profile Management
- **Retrieval**: View other users' profile information
- **Information**: Email, username, profile, bio, image information
- **Follow**: Follow/unfollow other users

### 2.2 Article Management
#### 2.2.1 Article CRUD
- **Creation**: Create articles with title, description, body, and tags
- **Retrieval**: View individual article details
- **Information**: Article creation information (author)
- **Editing**: Edit articles (author only)

#### 2.2.2 Article Lists
- **Global Feed**: All articles list (newest first)
- **Personal Feed**: Articles from followed users
- **Tag Filter**: Articles filtered by specific tags
- **Pagination**: 20 articles per page

#### 2.2.3 Article Interactions
- **Favorites**: Favorite/unfavorite articles
- **Favorite Count**: Display favorite count per article

### 2.3 Comment System
#### 2.3.1 Comment CRUD
- **Creation**: Create comments on articles
- **Retrieval**: View article comment lists
- **Deletion**: Delete comments (author only)

### 2.4 Tag System
- **Tag List**: List of frequently used tags
- **Tag Filter**: Filter articles by tags

## 3. Technology Stack and Architecture

### 3.1 Frontend Technology Stack
```
- Framework: React with Vite
- Language: TypeScript
- Router: Tanstack Router
- State Management: Tanstack Query (server state), Zustand (client state)
- UI Library: Mantine UI
- Form Handling: Mantine Form + Zod validation
- Styling: Mantine's CSS-in-JS + Custom CSS
- Icons: Tabler Icons (Mantine default icon set)
- Notifications: Mantine Notifications
- Testing: Vitest + React Testing Library
```

### 3.2 Backend Technology Stack
```
- Language: Go 1.21+
- HTTP Server: Standard net/http
- Database: SQLite (development), PostgreSQL (production)
- Database Access: Pure SQL (avoiding ORM)
- Authentication: JWT
- Validation: Go standard validation
- Testing: Go standard testing + testify
```

### 3.3 Development Environment
```
- Project Management: Makefile
- Containerization: Docker
- CI/CD: GitHub Actions
- Frontend Deployment: GitHub Pages
- Backend Deployment: AWS ECS + Fargate
- Infrastructure: AWS CDK (TypeScript)
- Monitoring: CloudWatch + X-Ray
```

## 4. API Design

### 4.1 User API
```
POST /api/users/login
POST /api/users
GET /api/user
PUT /api/user
```

### 4.2 Profile API
```
GET /api/profiles/:username
POST /api/profiles/:username/follow
DELETE /api/profiles/:username/follow
```

### 4.3 Article API
```
GET /api/articles
GET /api/articles/feed
GET /api/articles/:slug
POST /api/articles
PUT /api/articles/:slug
DELETE /api/articles/:slug
POST /api/articles/:slug/favorite
DELETE /api/articles/:slug/favorite
```

### 4.4 Comment API
```
GET /api/articles/:slug/comments
POST /api/articles/:slug/comments
DELETE /api/articles/:slug/comments/:id
```

### 4.5 Tag API
```
GET /api/tags
```

## 5. Database Design

### 5.1 Users Table (users)
```sql
id (Primary Key)
email (Unique)
username (Unique)
password_hash
bio
image
created_at
updated_at
```

### 5.2 Articles Table (articles)
```sql
id (Primary Key)
slug (Unique)
title
description
body
author_id (Foreign Key -> users.id)
created_at
updated_at
```

### 5.3 Tags Table (tags)
```sql
id (Primary Key)
name (Unique)
```

### 5.4 Article-Tag Relationship Table (article_tags)
```sql
article_id (Foreign Key -> articles.id)
tag_id (Foreign Key -> tags.id)
```

### 5.5 Follow Relationship Table (follows)
```sql
follower_id (Foreign Key -> users.id)
followed_id (Foreign Key -> users.id)
created_at
```

### 5.6 Favorites Table (favorites)
```sql
user_id (Foreign Key -> users.id)
article_id (Foreign Key -> articles.id)
created_at
```

### 5.7 Comments Table (comments)
```sql
id (Primary Key)
body
author_id (Foreign Key -> users.id)
article_id (Foreign Key -> articles.id)
created_at
updated_at
```

## 6. Frontend Design

### 6.1 Page Structure
```
/ (Home - Global Feed)
/login (Login)
/register (Register)
/settings (Settings)
/profile/:username (Profile)
/editor (Article Creation)
/editor/:slug (Article Edit)
/article/:slug (Article Detail)
```

### 6.2 Component Structure
```
components/
├── Layout/
│   ├── Header.tsx (Using Mantine Header, Navbar)
│   ├── Footer.tsx (Using Mantine Footer)
│   └── AppShell.tsx (Using Mantine AppShell)
├── Article/
│   ├── ArticleList.tsx (Using Mantine Grid, Card)
│   ├── ArticlePreview.tsx (Using Mantine Card, Badge)
│   ├── ArticleDetail.tsx (Using Mantine Container, TypographyStylesProvider)
│   └── ArticleForm.tsx (Using Mantine Form, TextInput, Textarea)
├── Comment/
│   ├── CommentList.tsx (Using Mantine Stack)
│   ├── CommentForm.tsx (Using Mantine Form, Textarea, Button)
│   └── CommentItem.tsx (Using Mantine Paper, Avatar, Text)
├── Profile/
│   ├── ProfileInfo.tsx (Using Mantine Avatar, Text, Group)
│   └── FollowButton.tsx (Using Mantine Button, ActionIcon)
├── Common/
│   ├── Loading.tsx (Using Mantine Loader, LoadingOverlay)
│   ├── ErrorBoundary.tsx (Using Mantine Alert, Notification)
│   ├── Pagination.tsx (Using Mantine Pagination)
│   └── TagsList.tsx (Using Mantine Badge, Group)
└── forms/
    ├── LoginForm.tsx (Using Mantine Form, PasswordInput)
    ├── RegisterForm.tsx (Using Mantine Form, TextInput)
    └── SettingsForm.tsx (Using Mantine Form, FileInput)
```

### 6.3 UI Theme and Styling (Mantine)
```typescript
// theme/index.ts
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'green', // RealWorld brand color
  colors: {
    brand: [
      '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc',
      '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1',
      '#075985', '#0c4a6e'
    ]
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        size: 'md',
        radius: 'md'
      }
    }),
    Card: Card.extend({
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true
      }
    })
  }
});

// Apply MantineProvider in App.tsx
<MantineProvider theme={theme}>
  <Notifications />
  <Router />
</MantineProvider>
```

### 6.4 State Management (Zustand + TanStack Query)
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

// Integration with Mantine Notifications
import { notifications } from '@mantine/notifications';

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    set({ user, token });
    notifications.show({
      title: 'Login Successful',
      message: `Welcome, ${user.username}!`,
      color: 'green'
    });
  },
  logout: () => {
    set({ user: null, token: null });
    notifications.show({
      title: 'Logout',
      message: 'You have been safely logged out.',
      color: 'blue'
    });
  }
}));
```

## 7. Backend Design

### 7.1 Project Structure
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   ├── handler/
│   ├── middleware/
│   ├── model/
│   ├── repository/
│   ├── service/
│   └── utils/
├── pkg/
├── migrations/
├── go.mod
├── go.sum
└── Makefile
```

### 7.2 Handler Structure
```go
// internal/handler/user.go
type UserHandler struct {
    userService service.UserService
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) error
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) error
```

### 7.3 Middleware
```go
// JWT Authentication Middleware
func JWTMiddleware() http.Handler

// CORS Middleware
func CORSMiddleware() http.Handler

// Logging Middleware
func LoggingMiddleware() http.Handler
```

## 8. Development Process

### 8.1 Development Phases
1. **Phase 1**: Basic CRUD and authentication implementation
2. **Phase 2**: Advanced features (follow, favorites) implementation
3. **Phase 3**: UI/UX improvements and optimization
4. **Phase 4**: Test writing and deployment

### 8.2 Vibe Coding Application
- **Rapid Prototyping**: MVP functionality implementation first
- **Iterative Improvement**: Gradual enhancement of feature completeness
- **Real-time Feedback**: TDD application and real-time testing
- **Documentation**: Concurrent API documentation with code development

### 8.3 Quality Management
- **Code Review**: Code review for all PRs
- **Automated Testing**: Automated test execution in CI/CD pipeline
- **Performance Monitoring**: Performance monitoring during development and after deployment

## 9. Deployment and Operations

### 9.1 Deployment Environments
- **Development Environment**: Local development servers
- **Frontend Production**: GitHub Pages with automated deployment
- **Backend Staging**: AWS ECS test environment
- **Backend Production**: AWS ECS production environment

### 9.2 CI/CD Pipeline
```yaml
# Frontend Pipeline (.github/workflows/frontend-deploy.yml)
name: Deploy Frontend to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['frontend/**']
jobs:
  build:
    - Run frontend tests
    - Run linting and type checking
    - Build for GitHub Pages
    - Deploy to GitHub Pages

# Backend Pipeline (.github/workflows/backend-deploy.yml)
name: Deploy Backend to AWS
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  test:
    - Run backend tests
    - Build Docker images
  deploy:
    - Push images to ECR
    - Update ECS service
```

### 9.3 Monitoring
- **Server Monitoring**: Server monitoring via CloudWatch
- **Application Performance**: Application performance logging and tracking
- **Usage Statistics**: Post-deployment usage and development statistics

## 10. Validation Criteria

### 10.1 Functional Validation Criteria
- [ ] Implementation of all RealWorld API specifications
- [ ] Implementation of all frontend pages
- [ ] User scenario testing passed
- [ ] Mobile responsive design working properly

### 10.2 Technical Validation Criteria
- [ ] Backend test coverage 80% or higher
- [ ] Frontend test coverage 80% or higher
- [ ] Performance requirements achieved (loading time under 3 seconds)
- [ ] Accessibility AA grade achieved

### 10.3 Operational Validation Criteria
- [ ] CI/CD pipeline setup
- [ ] Production environment deployment
- [ ] Monitoring system setup
- [ ] Documentation completion (API documentation, user guide)

---

*This PRD defines the detailed requirements for the RealWorld Vibe Coding implementation project.*