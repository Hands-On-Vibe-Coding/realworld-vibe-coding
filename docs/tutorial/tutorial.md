# RealWorld Vibe Coding Tutorial

## Introduction

This tutorial demonstrates how to build a complete RealWorld application using "Vibe Coding" methodology with Claude Code. The project showcases a full-stack implementation using Go backend, React frontend, and modern cloud deployment practices optimized for educational use.

## What is Vibe Coding?

Vibe Coding (바이브코딩) is a development methodology that emphasizes:
- **빠른 프로토타이핑** (Rapid Prototyping): Core functionality first
- **반복적 개선** (Iterative Improvement): Feature-by-feature enhancement
- **실시간 피드백** (Real-time Feedback): Continuous testing during development
- **문서화** (Documentation): Live documentation alongside development

## Project Overview

The RealWorld application is a full-stack clone of Medium.com that demonstrates:
- User authentication and profiles
- Article creation, editing, and management
- Comments and social features
- Modern web development practices
- Cost-optimized cloud deployment

## Tutorial Structure

This tutorial is organized around the key prompts and development phases that were used to build the application, showing the iterative development process and decision-making.

## Related Documentation

This tutorial references several project documents. For comprehensive understanding, also refer to:

- **📋 [Pre-PRD](../pre-prd.md)** - Initial requirements and technology evaluation
- **📊 [PRD](../prd.md)** - Detailed product requirements and specifications
- **🗺️ [Project Plan](../plan.md)** - Task breakdown and implementation roadmap
- **🚀 [Deployment Guide](../DEPLOYMENT.md)** - Complete deployment and infrastructure setup
- **🔧 [Git Hooks](../git-hooks.md)** - Development workflow and quality gates
- **📈 [Implementation Log](../implementations/claude-sonnet4/implementation-log.md)** - Detailed development progress tracking

## Phase 1: Project Planning and Setup

### Step 1: Initial Project Planning

**Key Prompt:**
```
이 프로젝트는 Realworld 를 바이브코딩으로 구현하는것이 목표야. 아키텍처 요건정의부터 구현까지 모두 Claude에게 맡기려고 해. 우선 PRD를 작성하기 위한 요건을 정하기 위해서 필요한 준비 문서를 pre-prd.md를 먼저 만들어줘.
```

**Why This Approach:**
- Establishes clear project scope and objectives
- Defines technical requirements before implementation
- Creates a foundation for architectural decisions
- Enables proper resource planning

**Results:**
- Created comprehensive [Pre-PRD document](../pre-prd.md)
- Defined tech stack selection criteria
- Established success metrics and timeline
- Outlined development phases

**Key Learning:** Always start with planning documents before coding. This prevents scope creep and ensures all stakeholders understand the project goals.

**📖 Related Documents:**
- [Pre-PRD](../pre-prd.md) - Complete initial requirements analysis
- [PRD](../prd.md) - Detailed product specification that followed

### Step 2: Tech Stack Selection

**Decision Framework:**
The project used specific criteria for technology choices:

**Backend Considerations:**
- **Go with Gin**: Chosen for performance and simplicity
- **SQLite**: Educational optimization over enterprise databases
- **JWT Authentication**: Industry standard for stateless auth

**Frontend Considerations:**
- **React 19 + TypeScript**: Modern React with type safety
- **Vite**: Fast build tool for development
- **TanStack Router**: Type-safe routing solution
- **Zustand + TanStack Query**: Lightweight state management

**Why These Choices:**
- Balances educational value with modern practices
- Optimizes for cost and simplicity
- Provides real-world applicable skills
- Supports rapid development cycles

**Key Learning:** Technology choices should align with project goals. For educational projects, prefer simplicity and cost-effectiveness over enterprise complexity.

### Step 3: Development Environment Setup

**Key Prompt:**
```
git hook에서 프론트와 백엔드 각각의 변경이 있을경우 lint, unit test를 실행하도록 되어 있는지 확인 해줘
```

**📖 Related Documentation:** [Git Hooks Setup Guide](../git-hooks.md)

**Setup Process:**
1. **Husky Configuration**: Pre-commit hooks for quality gates
2. **Lint-staged**: Incremental linting for changed files
3. **Automated Testing**: Unit tests run before commits
4. **Documentation**: Git hooks documentation for team

**Implementation:**
```bash
# Install development dependencies
npm install --save-dev husky lint-staged

# Configure pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Key Learning:** Establish quality gates early in development. Automated checks prevent bugs from entering the main branch and maintain code quality.

**📖 Detailed Setup:** See [Git Hooks Documentation](../git-hooks.md) for complete configuration details.

## Phase 2: Core Architecture Implementation

### Step 4: Backend API Development

**Architecture Pattern:**
The backend follows clean architecture principles:

```
cmd/server/main.go          # Entry point
internal/
├── handler/                # HTTP handlers
├── service/                # Business logic
├── repository/             # Data access
├── middleware/             # HTTP middleware
├── model/                  # Data models
└── utils/                  # Utility functions
```

**Key Implementation Prompts:**
- "Implement user authentication with JWT"
- "Create article management endpoints"
- "Add comment system with proper authorization"
- "Implement tag system for article categorization"

**Database Design:**
SQLite was chosen for educational purposes:
- Simplified deployment (no managed database)
- Zero-cost development environment
- Easy backup and migration
- Sufficient for educational workloads

**Key Learning:** Clean architecture enables maintainable code. Each layer has clear responsibilities and dependencies flow inward.

### Step 5: Frontend Development with Real-time Verification

**Innovative Approach:**
The project used Playwright MCP for real-time frontend verification:

**Key Prompt:**
```
프론트엔드 개발을 할 때 Playwright MCP를 사용해서 구현 상태를 확인해줘
```

**Verification Process:**
1. **Visual Verification**: Navigate to development server
2. **Screenshot Documentation**: Capture implementation progress
3. **Functional Testing**: Test user interactions
4. **Implementation Validation**: Verify features work correctly

**Example Workflow:**
```javascript
// Navigate to development server
await page.goto('http://localhost:5173');

// Take screenshot for documentation
await page.screenshot({ path: 'implementation-progress.png' });

// Test user interactions
await page.click('[data-testid="login-button"]');
await page.fill('[data-testid="email-input"]', 'test@example.com');
```

**Key Learning:** Real-time verification during development catches issues early and provides immediate feedback on implementation progress.

## Phase 3: Authentication and State Management

### Step 6: JWT Authentication Implementation

**Challenge:** Complex authentication flow with proper error handling

**Key Prompts:**
- "Implement JWT token generation and validation"
- "Create authentication middleware for protected routes"
- "Handle token refresh and expiration"

**Solution Architecture:**
```go
// JWT utility functions
func GenerateJWT(userID uint) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secretKey))
}

// Authentication middleware
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tokenString := extractTokenFromHeader(r)
        if tokenString == "" {
            http.Error(w, "Missing authorization header", http.StatusUnauthorized)
            return
        }
        // Validate token and extract claims
        // ...
    })
}
```

**Frontend State Management:**
```typescript
// Zustand auth store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    set({ 
      user: response.data.user, 
      token: response.data.token,
      isAuthenticated: true 
    });
  },
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

**Key Learning:** Authentication requires careful coordination between frontend and backend. State management should be centralized and consistent.

### Step 7: Debugging Authentication Issues

**Common Problem:** Authentication header not being sent with requests

**Debugging Process:**
1. **Browser Console Analysis**: Check network requests
2. **Code Review**: Examine API client configuration
3. **Systematic Testing**: Test each component separately
4. **Fix Implementation**: Update header handling

**Key Prompt:**
```
로그인 후 사용자 정보를 가져올 때 Authorization 헤더가 제대로 전송되지 않는 문제가 있어요. 이 문제를 해결해주세요.
```

**Solution:**
```typescript
// API client with automatic auth headers
const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Key Learning:** Systematic debugging approach is crucial. Start with symptom analysis, then work through the system methodically.

## Phase 4: Frontend User Interface

### Step 8: Component-Based Architecture

**Architecture Pattern:**
```
src/
├── components/
│   ├── Article/           # Article-related components
│   ├── Comment/           # Comment components
│   ├── Common/            # Shared components
│   ├── Layout/            # Layout components
│   └── Profile/           # Profile components
├── pages/                 # Page components
├── hooks/                 # Custom hooks
├── stores/                # State management
└── lib/                   # Utilities and API
```

**Key Implementation Prompts:**
- "Create article list component with pagination"
- "Implement comment system with real-time updates"
- "Add profile page with follow/unfollow functionality"
- "Create article editor with tag management"

**Component Design Principles:**
1. **Single Responsibility**: Each component has one clear purpose
2. **Reusability**: Components can be used across different pages
3. **Type Safety**: Full TypeScript integration
4. **Accessibility**: Proper ARIA attributes and keyboard navigation

**Key Learning:** Component-based architecture promotes code reuse and maintainability. Clear separation of concerns makes the codebase easier to understand and modify.

### Step 9: State Management Strategy

**Hybrid Approach:**
- **Zustand**: Client-side state (authentication, UI state)
- **TanStack Query**: Server state (articles, comments, profiles)

**Example Implementation:**
```typescript
// Server state with TanStack Query
export const useArticles = (filters: ArticleFilters) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => api.getArticles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Client state with Zustand
export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
}));
```

**Key Learning:** Different types of state require different management strategies. Server state and client state have different characteristics and should be handled accordingly.

## Phase 5: Testing and Quality Assurance

### Step 10: Testing Strategy

**Multi-layered Testing Approach:**
1. **Unit Tests**: Component and utility function tests
2. **Integration Tests**: API endpoint tests
3. **End-to-end Tests**: Complete user workflow tests

**Backend Testing:**
```go
func TestUserAuthentication(t *testing.T) {
    // Setup test database
    db := setupTestDB()
    defer db.Close()
    
    // Test user registration
    user := &model.User{
        Email:    "test@example.com",
        Username: "testuser",
        Password: "hashedpassword",
    }
    
    err := userService.CreateUser(user)
    assert.NoError(t, err)
    
    // Test login
    token, err := userService.Login("test@example.com", "password")
    assert.NoError(t, err)
    assert.NotEmpty(t, token)
}
```

**Frontend Testing:**
```typescript
// Component testing with React Testing Library
describe('ArticleList', () => {
  it('renders articles correctly', () => {
    const mockArticles = [
      { title: 'Test Article', author: 'Test Author' },
    ];
    
    render(<ArticleList articles={mockArticles} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
});
```

**Key Learning:** Testing should be integrated throughout development, not added at the end. Different testing levels serve different purposes and should be used together.

### Step 11: Code Quality and Linting

**Quality Tools Configuration:**
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Go fmt**: Go code formatting
- **Go vet**: Go code analysis

**Pre-commit Hook Configuration:**
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.go": [
      "go fmt",
      "go vet"
    ]
  }
}
```

**Key Learning:** Automated quality checks maintain consistency and catch issues early. Configuration should be project-specific and team-agreed.

## Phase 6: Deployment and Infrastructure

### Step 12: Cost-Optimized Cloud Architecture

**Educational Infrastructure Design:**
- **Backend**: AWS ECS with Fargate Spot instances (70% cost savings)
- **Frontend**: GitHub Pages (free hosting)
- **Database**: SQLite in-container (no managed database costs)
- **CDN**: CloudFront for global distribution

**📖 Complete Setup Guide:** [Deployment Documentation](../DEPLOYMENT.md)

**Key Prompt:**
```
교육용 프로젝트에 최적화된 인프라를 구성해주세요. 비용 효율성을 우선시하면서도 실제 운영 환경과 유사한 구조를 만들어주세요.
```

**Infrastructure as Code:**
```typescript
// AWS CDK for infrastructure
export class RealWorldStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    
    // ECS Cluster with Spot instances
    const cluster = new ecs.Cluster(this, 'RealWorldCluster', {
      vpc: vpc,
      capacityProviders: ['FARGATE_SPOT'],
    });
    
    // Task definition with minimal resources
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
  }
}
```

**Deployment Pipeline:**
```yaml
# GitHub Actions for CI/CD
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Backend
        run: |
          docker build -t realworld-backend .
          aws ecs update-service --cluster realworld --service backend
      - name: Deploy Frontend
        run: |
          npm run build
          aws s3 sync dist/ s3://realworld-frontend/
```

**Key Learning:** Educational projects can use production-ready infrastructure with cost optimizations. Spot instances and serverless services provide significant savings while maintaining functionality.

**📖 Implementation Details:** 
- [Deployment Guide](../DEPLOYMENT.md) - Complete infrastructure setup
- [Project Plan](../plan.md) - Original infrastructure planning decisions

### Step 13: Monitoring and Observability

**Observability Stack:**
- **Application Logs**: Structured logging with context
- **Metrics**: Basic performance metrics
- **Health Checks**: Application health monitoring

**Implementation:**
```go
// Structured logging
func (h *Handler) CreateArticle(w http.ResponseWriter, r *http.Request) {
    logger := log.With().
        Str("method", r.Method).
        Str("path", r.URL.Path).
        Logger()
    
    logger.Info().Msg("Creating article")
    
    // Implementation...
    
    logger.Info().
        Uint("article_id", article.ID).
        Msg("Article created successfully")
}
```

**Key Learning:** Observability should be built into the application from the start. Simple monitoring is better than no monitoring.

## Phase 7: Documentation and Knowledge Transfer

### Step 14: Living Documentation

**Documentation Strategy:**
- **Code Comments**: Focused on why, not what
- **API Documentation**: OpenAPI/Swagger specification
- **Architecture Decision Records**: Document important decisions
- **Tutorial Documentation**: This tutorial itself

**Key Prompt:**
```
프로젝트의 모든 문서를 영어로 작성해주세요. 국제적인 개발자들도 접근할 수 있도록 하고, 프로젝트 전체에서 일관성을 유지하기 위해서입니다.
```

**Documentation Approach:**
1. **Real-time Updates**: Documentation updated with code changes
2. **Multiple Languages**: English, Korean, Japanese versions
3. **Practical Examples**: Real code examples, not theoretical
4. **Decision Context**: Why decisions were made, not just what was done

**Key Learning:** Documentation should be treated as a first-class citizen. International accessibility requires English documentation, but local language versions add value.

## Key Vibe Coding Principles Demonstrated

### 1. Rapid Prototyping (빠른 프로토타이핑)
- Started with core user authentication
- Implemented basic CRUD operations first
- Added features incrementally

### 2. Iterative Improvement (반복적 개선)
- Refined UI components based on testing
- Optimized performance after basic functionality
- Enhanced error handling over time

### 3. Real-time Feedback (실시간 피드백)
- Used Playwright MCP for continuous verification
- Implemented hot reloading for development
- Regular testing during development

### 4. Documentation (문서화)
- Maintained README files throughout development
- Created this comprehensive tutorial
- Documented architectural decisions

## Common Pitfalls and Solutions

### Authentication Issues
**Problem**: Token not being sent with requests
**Solution**: Centralized API client with automatic header injection

### State Management Complexity
**Problem**: Mixing server and client state
**Solution**: Use different tools for different state types

### Database Choice
**Problem**: Over-engineering with enterprise databases
**Solution**: SQLite for educational projects, PostgreSQL for production

### Deployment Costs
**Problem**: High cloud costs for learning projects
**Solution**: Spot instances, serverless where possible, GitHub Pages for frontend

## Conclusion

This tutorial demonstrates how Vibe Coding methodology can be applied to build a complete, production-ready application. The key insights are:

1. **Start with Planning**: Proper documentation and planning prevent scope creep
2. **Choose Appropriate Technology**: Match technology choices to project goals
3. **Build Quality Gates Early**: Automated testing and linting from the start
4. **Use Real-time Feedback**: Continuous verification during development
5. **Optimize for Context**: Educational projects have different constraints than enterprise projects
6. **Document Everything**: Knowledge transfer is crucial for project success

The result is a RealWorld application that serves as both a learning tool and a practical example of modern web development practices. The project successfully demonstrates that AI-assisted development can produce high-quality, well-documented, and maintainable code when guided by proper methodology.

## Next Steps

To continue learning:

1. **Extend the Application**: Add features like notifications, search, or social sharing
2. **Explore Different Stacks**: Try the same project with different technologies
3. **Scale the Architecture**: Move to microservices or serverless architecture
4. **Implement Advanced Features**: Add real-time features with WebSockets
5. **Optimize Performance**: Implement caching, CDN, and performance monitoring

The foundation provided by this tutorial enables these advanced explorations while maintaining the core principles of Vibe Coding methodology.

## Additional Resources

### Project Documentation
- **📋 [Pre-PRD](../pre-prd.md)** - Initial requirements and technology evaluation
- **📊 [PRD](../prd.md)** - Complete product requirements document
- **🗺️ [Project Plan](../plan.md)** - Detailed implementation roadmap
- **🚀 [Deployment Guide](../DEPLOYMENT.md)** - Infrastructure and deployment setup
- **🔧 [Git Hooks](../git-hooks.md)** - Development workflow configuration

### Implementation Tracking
- **📈 [Claude Sonnet 4 Implementation](../implementations/claude-sonnet4/implementation-log.md)** - Detailed development log
- **📊 [Vibe Coding Experiment Plan](../vibe-coding-experiment-plan.md)** - Tool comparison methodology

### Language Versions
- **🇰🇷 [Korean Tutorial](tutorial-ko.md)** - 한국어 튜토리얼
- **🇯🇵 [Japanese Tutorial](tutorial-ja.md)** - 日本語チュートリアル