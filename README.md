# RealWorld Application - Vibe Coding Implementation

> A full-stack RealWorld application built with Go backend and React frontend using Vibe Coding methodology.

## Overview

This project implements the [RealWorld](https://github.com/gothinkster/realworld) application specification - a Medium.com clone that demonstrates real-world usage of modern web technologies. Built with a focus on rapid prototyping, iterative improvement, and real-time documentation.

## Tech Stack

This project is built using the recommended technology stack from Armin Ronacher's blog post ["Agentic Coding Recommendations"](https://lucumr.pocoo.org/2025/6/12/agentic-coding/), which emphasizes simplicity, reliability, and AI-friendly development patterns.

### Backend
- **Language**: Go 1.21+ 
- **Framework**: Standard net/http with Gorilla Mux
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT-based authentication
- **Architecture**: Clean architecture with dependency injection

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

Database migrations are automatically applied on server startup.

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards and run tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Deployment

### Environment Variables

**Backend:**
```bash
PORT=8080
DATABASE_URL=realworld.db
JWT_SECRET=your-secret-key
ENVIRONMENT=development
```

**Frontend:**
```bash
VITE_API_URL=http://localhost:8080/api
```

### Production Deployment
```bash
make deploy
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RealWorld](https://github.com/gothinkster/realworld) - The specification and community
- [Mantine](https://mantine.dev/) - React components library
- [TanStack](https://tanstack.com/) - Modern React tooling
- The Go community for excellent standard library and ecosystem

---

Built with ❤️ using 바이브코딩 methodology