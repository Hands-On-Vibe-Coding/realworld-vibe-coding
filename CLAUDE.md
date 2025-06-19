# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RealWorld application implementation using "바이브코딩" (Vibe Coding) methodology. The project implements a complete RealWorld spec-compliant application with Go backend and React frontend.

## Architecture

This is a full-stack application with clear separation between frontend and backend:

### Backend (Go)
- **Language**: Go 1.23+ with standard net/http and Gorilla Mux
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT-based authentication
- **Structure**: Clean architecture with internal packages
  - `cmd/server/main.go` - Application entry point
  - `internal/handler/` - HTTP handlers (user, article, comment, profile)
  - `internal/service/` - Business logic layer
  - `internal/repository/` - Data access layer
  - `internal/middleware/` - HTTP middleware (JWT, CORS, logging)
  - `internal/model/` - Data models
  - `internal/config/` - Configuration management
  - `internal/utils/` - Utility functions

### Frontend (React + TypeScript)
- **Framework**: React 19 with Vite build tool
- **Language**: TypeScript with strict type checking
- **Router**: Tanstack Router for type-safe routing
- **State Management**: 
  - Tanstack Query for server state
  - Zustand for client state (auth store)
- **Styling**: Tailwind CSS with forms and typography plugins
- **Forms**: React Hook Form with Zod validation
- **Structure**:
  - `src/pages/` - Page components
  - `src/components/` - Reusable components (Article, Layout, Common)
  - `src/stores/` - Zustand stores
  - `src/lib/` - API client and utilities

## Development Commands

### Project Setup
```bash
make setup          # Initial development environment setup
```

### Development Servers
```bash
make dev            # Run both frontend and backend servers
make dev-front      # Run frontend dev server only (http://localhost:5173)
make dev-back       # Run backend dev server only (http://localhost:8080)
```

### Building
```bash
make build          # Build both frontend and backend
```

### Testing
```bash
make test           # Run all tests
make test-front     # Run frontend tests only
make test-back      # Run backend tests only (go test ./...)
```

### Code Quality
```bash
make lint           # Run linting (npm run lint + go vet ./...)
make format         # Format code (go fmt ./...)
```

### Cleanup and Utilities
```bash
make clean          # Clean build artifacts
make docker         # Build Docker images
make deploy         # Production deployment
```

### Backend Specific Commands
```bash
cd backend
go run cmd/server/main.go    # Run backend server directly
go test ./...                # Run backend tests
go vet ./...                 # Backend linting
go fmt ./...                 # Backend formatting
```

### Frontend Specific Commands
```bash
cd frontend
npm run dev         # Development server
npm run build       # Production build
npm run lint        # ESLint checking
npm run preview     # Preview production build
```

## API Endpoints

The backend implements the complete RealWorld API specification:

### Authentication
- `POST /api/users` - User registration
- `POST /api/users/login` - User login
- `GET /api/user` - Get current user
- `PUT /api/user` - Update user

### Articles
- `GET /api/articles` - List articles
- `GET /api/articles/feed` - Get user feed
- `GET /api/articles/{slug}` - Get article by slug
- `POST /api/articles` - Create article
- `PUT /api/articles/{slug}` - Update article
- `DELETE /api/articles/{slug}` - Delete article
- `POST /api/articles/{slug}/favorite` - Favorite article
- `DELETE /api/articles/{slug}/favorite` - Unfavorite article

### Comments
- `GET /api/articles/{slug}/comments` - Get comments
- `POST /api/articles/{slug}/comments` - Add comment
- `DELETE /api/articles/{slug}/comments/{id}` - Delete comment

### Profiles
- `GET /api/profiles/{username}` - Get profile
- `POST /api/profiles/{username}/follow` - Follow user
- `DELETE /api/profiles/{username}/follow` - Unfollow user

### Tags
- `GET /api/tags` - Get tags

## Development Guidelines

### Project Planning Workflow
When asked to plan a project, follow these steps:

1. **Read Design Documents**: First, read the design document and existing rules in memory
2. **Create Implementation Plan**: Write the implementation plan with 10-20 tasks in `plan.md` file, including task dependencies
3. **Create GitHub Issues**: Create GitHub issues for each task with detailed descriptions, labels, and milestones

#### GitHub Issue Creation Process
Use the `gh` command to create issues with the following structure:

```bash
# Create issues with proper labels and milestones
gh issue create --title "TASK-{number}: {Title}" --body "$(cat <<'EOF'
## Description
Brief description of the task

## Background
Context and background information needed

## Acceptance Criteria
- [ ] Specific criteria 1
- [ ] Specific criteria 2

## Technical Details
### Code Examples
```{language}
// Example code here
```

## Dependencies
- #{issue-number}: {dependency description}

## Estimated Time
{time estimate}
EOF
)" --label "enhancement,task" --milestone "Sprint 1"
```

#### GitHub Issue Management
- **Labels**: Use consistent labels like `enhancement`, `bug`, `task`, `frontend`, `backend`, `documentation`
- **Milestones**: Group issues into development phases (Sprint 1, Sprint 2, etc.)
- **Dependencies**: Reference other issues using `#{issue-number}` format
- **Assignees**: Assign issues when implementation begins
- **Projects**: Use GitHub Projects for kanban-style tracking

#### Guidelines for Issue Creation
- Use descriptive titles with task numbering: `TASK-{number}: {Title}`
- Include comprehensive background and context in issue descriptions
- Use markdown code blocks with language specification
- Common languages: go, javascript, typescript, bash, sql, yaml
- Consult with Perplexity MCP when appropriate for technical research
- Add appropriate labels for categorization and filtering
- Link related issues and dependencies
- Include acceptance criteria as checkboxes for progress tracking

### Cursor Rules Integration
The project includes cursor rules for automated project planning that should be followed when creating implementation plans or task breakdowns.

### Code Organization
- Follow the established directory structure
- Backend uses clean architecture principles
- Frontend uses component-based architecture with proper separation of concerns
- Maintain TypeScript strict mode compliance

### Testing Requirements
- Target 80%+ test coverage for both frontend and backend
- Backend tests use Go standard testing with testify
- Frontend tests should use Vitest and React Testing Library

### Authentication Flow
- JWT tokens are stored in Zustand auth store
- API client automatically includes authentication headers
- Protected routes use authentication middleware

## Database Schema

Key entities and relationships:
- Users (authentication and profiles)
- Articles (with slug-based URLs)
- Comments (nested under articles)
- Tags (many-to-many with articles)
- Follows (user relationships)
- Favorites (user-article relationships)

## Project Status

This project is in its initial planning phase. The codebase currently contains:
- `docs/pre-prd.md`: Pre-PRD document outlining requirements, tech stack considerations, and implementation approach
- `docs/prd.md`: PRD document (currently empty, to be filled)

## Development Approach

The project follows a "바이브코딩" (Vibe Coding) methodology which emphasizes:
1. **빠른 프로토타이핑** (Rapid Prototyping): Core functionality implementation first
2. **반복적 개선** (Iterative Improvement): Gradual enhancement of features
3. **실시간 피드백** (Real-time Feedback): Continuous testing during development
4. **문서화** (Documentation): Real-time documentation alongside code

## Planned Architecture

Based on the pre-PRD document, the project will implement:

### Core Features
- User management (registration, authentication, profiles, follow/unfollow)
- Article management (CRUD operations, favorites, tags)
- Comment system
- JWT-based authentication
- Responsive design with mobile support

### Technical Requirements
- TypeScript implementation for type safety
- 80%+ test coverage requirement
- ESLint and Prettier for code quality
- Component/module-based architecture
- SEO optimization considerations

### Development Phases
- **Phase 1**: Basic CRUD implementation (2 weeks)
- **Phase 2**: Authentication and authorization (1 week)  
- **Phase 3**: Advanced features (2 weeks)
- **Phase 4**: Optimization and deployment (1 week)

## Success Criteria

### Functional Requirements
- 100% RealWorld API spec compliance
- Cross-browser compatibility
- Mobile responsive design
- All user stories implemented

### Technical Requirements
- 80%+ test coverage
- Build time under 30 seconds
- Bundle size optimization
- AA accessibility compliance

## Tech Stack Considerations

The pre-PRD outlines several technology options to be decided:

### Frontend Options
- React vs Vue vs Angular
- State management: Redux, Zustand, Context API
- Routing: React Router, Next.js
- Styling: CSS-in-JS, Tailwind CSS, Styled Components

### Backend Options  
- Node.js vs Python vs Go
- Frameworks: Express, Fastify, FastAPI, Gin
- ORM: Prisma, TypeORM, SQLAlchemy
- Database: PostgreSQL, MySQL, SQLite

## Development Workflow

When implementing features:
1. Review the RealWorld specification requirements
2. Follow the established coding patterns once they're defined
3. Implement tests alongside feature code
4. Ensure mobile responsiveness
5. Validate against RealWorld API spec
6. Run linting and type checking before commits

## Next Steps

1. Finalize technology stack decisions
2. Complete detailed PRD document
3. Set up development environment
4. Design project structure
5. Plan first sprint implementation