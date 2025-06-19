# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RealWorld application implementation using "바이브코딩" (Vibe Coding) methodology. The project aims to build a complete RealWorld spec-compliant application from architecture requirements to full implementation.

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