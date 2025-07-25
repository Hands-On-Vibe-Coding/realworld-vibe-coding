# RealWorld Application - Vibe Coding Implementation

[![Backend Deploy](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/actions/workflows/backend-deploy.yml/badge.svg)](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/actions/workflows/backend-deploy.yml)
[![Frontend Deploy](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/actions/workflows/frontend-deploy.yml/badge.svg)](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/actions/workflows/frontend-deploy.yml)

**🌐 Language / 言語 / 언어**
- [한국어](README.ko.md) | [日本語](README.jp.md) | **English**

> A full-stack RealWorld application built with Go backend and React frontend using Vibe Coding methodology. Optimized for educational use with SQLite database and cost-efficient Fargate Spot deployment.

## Overview

This project implements the [RealWorld](https://github.com/gothinkster/realworld) application specification - a Medium.com clone that demonstrates real-world usage of modern web technologies. **This is a Vibe Coding learning project** that follows Armin Ronacher's ["Agentic Coding Recommendations"](https://lucumr.pocoo.org/2025/6/12/agentic-coding/) methodology.

### Project Development Journey

This project demonstrates a complete **Vibe Coding** implementation process:

1. **📋 [Rules & Guidelines](CLAUDE.md) Creation** - Established project rules and coding standards based on Armin Ronacher's recommendations
2. **📝 [Pre-PRD](/docs/pre-prd.md) Development** - Initial requirement gathering and technology stack evaluation
3. **📊 [PRD (Product Requirements Document)](/docs/prd.md)** - Detailed specification and feature planning
4. **🗺️ [Project Planning](/docs/plan.md)** - Task breakdown and implementation roadmap
5. **⚡ [Rapid Implementation](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/issues?q=is%3Aissue)** - Core functionality development using Vibe Coding principles

### Vibe Coding Principles Applied

Following Armin Ronacher's methodology, this project emphasizes:

- **Simplicity over Complexity**: Using proven, reliable technologies
- **AI-Friendly Development**: Clear documentation and structured code patterns
- **Rapid Prototyping**: Quick iterations with immediate feedback
- **Educational Focus**: Cost-optimized deployment suitable for learning
- **Real-time Documentation**: Living documentation that evolves with code

## 🧪 Vibe Coding Tools Comparison Experiment

This repository serves as a comprehensive comparison study of various "Vibe Coding" tools by implementing the same RealWorld application specification using different AI-powered development tools. The goal is to provide objective, data-driven insights into the capabilities, strengths, and limitations of each tool.

### 📊 Implementation Results

| Tool | Status | Branch | Completion | Dev Time | Code Quality | Experience |
|------|--------|--------|------------|----------|--------------|------------|
| **Claude Sonnet 4** | ✅ Complete | [`main`](/) | 100% | 7 days | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Claude 3.5 Sonnet | 🔄 Planned | `claude-3.5-sonnet` | - | - | - | - |
| Cursor + Claude | 🔄 Planned | `cursor-claude` | - | - | - | - |
| Cursor + GPT-4 | 🔄 Planned | `cursor-gpt4` | - | - | - | - |
| GitHub Copilot | 🔄 Planned | `github-copilot` | - | - | - | - |
| Windsurf | 🔄 Planned | `windsurf` | - | - | - | - |
| Codeium | 🔄 Planned | `codeium` | - | - | - | - |

### 🎯 Baseline Implementation (Claude Sonnet 4)

The current `main` branch represents our baseline implementation completed with **Claude Code + Claude Sonnet 4**:

- **🕒 Development Period**: June 20-27, 2025 (7 days)
- **📋 Feature Completeness**: 100% RealWorld API compliance (22/22 endpoints)
- **🧪 Test Coverage**: 44 passing tests
- **🚀 Deployment**: Live on [GitHub Pages](https://hands-on-vibe-coding.github.io/realworld-vibe-coding/) + AWS ECS
- **📊 Code Metrics**: 79 files, ~4000 lines of production code

### 📋 Experiment Details

**Methodology**: Each tool implements the identical RealWorld specification starting from the [`v1.0.0-foundation`](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/releases/tag/v1.0.0-foundation) tag, which contains only project documentation and planning.

**Evaluation Criteria**:
- **Functional Completeness** (40%): RealWorld API compliance
- **Development Productivity** (25%): Time-to-implementation
- **Code Quality** (20%): Test coverage, architecture, maintainability  
- **Developer Experience** (10%): Tool usability and learning curve
- **Deployment Success** (5%): Build and deployment reliability

**📖 Documentation**: 
- [📋 Experiment Plan](docs/vibe-coding-experiment-plan.md)
- [📊 Implementation Logs](docs/implementations/)
- [🔬 Comparison Analysis](docs/comparison-report.md) *(Coming Soon)*

### 🔗 Quick Links

- **🌐 Live Demo**: [RealWorld App](https://hands-on-vibe-coding.github.io/realworld-vibe-coding/)
- **📚 API Documentation**: [RealWorld API Spec](https://realworld-docs.netlify.app/docs/specs/backend-specs/introduction)
- **📖 Tutorial**: [Comprehensive Tutorial](docs/tutorial/tutorial.md) | [한국어](docs/tutorial/tutorial-ko.md) | [日本語](docs/tutorial/tutorial-ja.md)
- **🏷️ Tags**: [`v1.0.0-foundation`](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/releases/tag/v1.0.0-foundation) | [`v1.0.0-claude-sonnet4`](https://github.com/Hands-On-Vibe-Coding/realworld-vibe-coding/releases/tag/v1.0.0-claude-sonnet4)

---

## Tech Stack

This project is built using the recommended technology stack from Armin Ronacher's blog post ["Agentic Coding Recommendations"](https://lucumr.pocoo.org/2025/6/12/agentic-coding/), which emphasizes simplicity, reliability, and AI-friendly development patterns.

### Backend
- **Language**: Go 1.21+ 
- **Framework**: Standard net/http with Gorilla Mux
- **Database**: SQLite (optimized for education and simplicity)
- **Authentication**: JWT-based authentication
- **Architecture**: Clean architecture with dependency injection
- **Deployment**: AWS ECS Fargate Spot for cost optimization

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine v8
- **Routing**: TanStack Router (type-safe)
- **State Management**: 
  - Zustand (client state)
  - TanStack Query (server state)
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hands-on-vibe-coding/realworld-vibe-coding.git
   cd realworld-vibe-coding
   ```

2. **Setup development environment**
   ```bash
   make setup
   ```

3. **Start development servers**
   ```bash
   make dev
   ```
   
   This will start:
   - Backend server: http://localhost:8080
   - Frontend server: http://localhost:5173

## Available Commands

### Project-level Commands
```bash
make setup          # Initial development environment setup
make dev            # Run both frontend and backend servers
make build          # Build both frontend and backend
make test           # Run all tests
make lint           # Run linting for both projects
make clean          # Clean build artifacts
```

### Backend Commands
```bash
make dev-back       # Run backend server only
make test-back      # Run backend tests
make build-back     # Build backend binary

# Direct Go commands (from backend/ directory)
go run cmd/server/main.go    # Run server directly
go test ./...                # Run tests
go vet ./...                 # Lint code
```

### Frontend Commands  
```bash
make dev-front      # Run frontend dev server only
make test-front     # Run frontend tests
make build-front    # Build frontend for production

# Direct npm commands (from frontend/ directory)
npm run dev         # Development server
npm run build       # Production build
npm run test        # Run tests
npm run lint        # ESLint checking
```

## Project Structure

```
├── backend/                 # Go backend
│   ├── cmd/server/         # Application entry point
│   ├── internal/           # Internal packages
│   │   ├── config/         # Configuration management
│   │   ├── db/            # Database connection and migrations
│   │   ├── handler/       # HTTP handlers
│   │   ├── middleware/    # HTTP middleware
│   │   ├── model/         # Data models
│   │   ├── repository/    # Data access layer
│   │   ├── service/       # Business logic layer
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Database migration files
│   └── pkg/              # Public packages
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   ├── lib/          # API client and utilities
│   │   ├── types/        # TypeScript type definitions
│   │   └── theme/        # Mantine theme configuration
│   └── public/           # Static assets
└── docs/                 # Project documentation
```

## Database Schema

The application uses a relational database with the following entities:

- **Users**: User accounts with authentication
- **Articles**: Blog posts with slug-based URLs
- **Comments**: Nested comments on articles
- **Tags**: Article categorization
- **Follows**: User relationship management
- **Favorites**: Article bookmarking

Database migrations are automatically applied on server startup. SQLite provides a simple, file-based database perfect for educational environments.

## API Endpoints

The backend implements the complete [RealWorld API specification](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints):

### Authentication
- `POST /api/users` - User registration
- `POST /api/users/login` - User login
- `GET /api/user` - Get current user
- `PUT /api/user` - Update user

### Articles
- `GET /api/articles` - List articles (with pagination)
- `GET /api/articles/feed` - Get user feed
- `GET /api/articles/{slug}` - Get article by slug
- `POST /api/articles` - Create article
- `PUT /api/articles/{slug}` - Update article
- `DELETE /api/articles/{slug}` - Delete article

### Profiles & Social Features
- `GET /api/profiles/{username}` - Get user profile
- `POST /api/profiles/{username}/follow` - Follow user
- `DELETE /api/profiles/{username}/follow` - Unfollow user
- `POST /api/articles/{slug}/favorite` - Favorite article
- `DELETE /api/articles/{slug}/favorite` - Unfavorite article

### Comments & Tags
- `GET /api/articles/{slug}/comments` - Get comments
- `POST /api/articles/{slug}/comments` - Add comment
- `DELETE /api/articles/{slug}/comments/{id}` - Delete comment
- `GET /api/tags` - Get popular tags

## Development Methodology

This project follows "Vibe Coding" principles:

1. **Rapid Prototyping** : Core functionality first
2. **Iterative Improvement** : Gradual feature enhancement
3. **Real-time Feedback** : Continuous testing during development
4. **Documentation** : Real-time documentation alongside code

## Testing

### Backend Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Database migration testing
- Target: 80%+ code coverage

### Frontend Testing
- Component unit tests with React Testing Library
- Integration tests for user workflows
- End-to-end tests with Playwright
- Type safety with TypeScript strict mode

### Git Hooks
The project uses automated pre-commit hooks to ensure code quality:
- **Linting and Formatting**: Automatically runs for staged files
- **Testing**: Runs tests only for changed parts (frontend/backend)
- **Go Quality Checks**: `go fmt` and `go vet` for backend code

For detailed information, see [Git Hooks Documentation](./docs/git-hooks.md).

## Deployment

This project is optimized for educational deployment with minimal cost and complexity.

### Architecture
- **Frontend**: GitHub Pages with automated CI/CD
- **Backend**: AWS ECS Fargate Spot (70% cost savings)
- **Database**: SQLite (in-container, no external database)
- **Load Balancer**: Application Load Balancer
- **Estimated Cost**: $5-10/month

### AWS Infrastructure
- **Compute**: 0.25 vCPU, 512MB RAM (minimal resources)
- **Networking**: VPC with public/private subnets
- **Storage**: Container-based SQLite (resets on restart)
- **Monitoring**: Basic CloudWatch logs

### Deployment Process
1. **Automatic**: Push to `main` branch triggers deployment
2. **Build**: Creates optimized Docker image with SQLite
3. **Deploy**: Updates ECS service with new image
4. **Health Check**: Verifies application startup

### Manual Deployment
```bash
# Deploy infrastructure
cd infrastructure
npm run deploy

# Build and push Docker image (done automatically)
cd backend
docker build -t realworld-backend .
```

For detailed deployment information, see [Deployment Documentation](./docs/DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards and run tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Deployment

This application uses a hybrid deployment strategy with automated CI/CD pipelines:

- **Frontend**: GitHub Pages with automated deployment
- **Backend**: AWS ECS with Fargate containers
- **Database**: AWS RDS PostgreSQL
- **Infrastructure**: AWS CDK for infrastructure as code

### Quick Start Deployment

1. **Frontend**: Automatically deploys to https://dohyunjung.github.io/realworld-vibe-coding/ on every push
2. **Backend**: Requires AWS infrastructure setup and GitHub secrets configuration

### Detailed Deployment Guide

For comprehensive deployment instructions including:

- AWS infrastructure setup with CDK
- GitHub Actions CI/CD configuration
- Environment variables and secrets management
- Monitoring and troubleshooting
- Cost optimization strategies
- Security considerations

**📖 See [Deployment Guide](docs/DEPLOYMENT.md) for complete instructions.**

### Local Development

```bash
# Backend
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=your-secret-key
ENVIRONMENT=development

# Frontend
VITE_API_BASE_URL=http://localhost:8080
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RealWorld](https://github.com/gothinkster/realworld) - The specification and community
- [Mantine](https://mantine.dev/) - React components library
- [TanStack](https://tanstack.com/) - Modern React tooling
- The Go community for excellent standard library and ecosystem

---

## Development Tools

This project was developed using:
- **Claude Code**: AI-powered development tool for rapid prototyping and implementation
- **Claude Sonnet 4**: Advanced language model for code generation and technical guidance

Built with ❤️ using 바이브코딩 methodology