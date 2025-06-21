# Git Hooks Documentation

This document explains the git hook configuration for the RealWorld Vibe Coding project, which ensures code quality through automated linting and testing before commits.

## Overview

The project uses Husky to manage git hooks with automated linting and testing workflows. The pre-commit hook runs whenever you attempt to commit changes, ensuring that only properly formatted and tested code enters the repository.

## Pre-commit Hook Configuration

### Location
- **Husky configuration**: `.husky/pre-commit`
- **Package configuration**: `package.json` (lint-staged section)

### Workflow

The pre-commit hook follows this sequence:

1. **Linting and Formatting** (via lint-staged)
   - Frontend files (`*.ts`, `*.tsx`, `*.js`, `*.jsx`): Runs ESLint with auto-fix
   - Backend files (`*.go`): Runs `go fmt` and `go vet`

2. **Conditional Testing**
   - Detects which parts of the codebase have changes
   - Runs frontend tests only if frontend files changed
   - Runs backend tests only if backend files changed
   - Skips tests if no code changes detected

### Supported File Types

#### Frontend
- **Extensions**: `.ts`, `.tsx`, `.js`, `.jsx`
- **Path**: `frontend/src/**/*`
- **Actions**: 
  - Linting with auto-fix: `npm run lint:fix`
  - Testing: `npm run test` (Vitest)

#### Backend
- **Extensions**: `.go`
- **Path**: `backend/**/*`
- **Actions**:
  - Formatting: `go fmt`
  - Linting: `go vet`
  - Testing: `go test ./...`

## Commands Reference

### Root Level Commands
```bash
# Run all linting (frontend + backend)
npm run lint

# Run all tests (frontend + backend)
npm run test

# Run all builds (frontend + backend)
npm run build
```

### Frontend Specific
```bash
cd frontend
npm run lint        # ESLint check
npm run lint:fix    # ESLint with auto-fix
npm run test        # Vitest tests
npm run build       # Production build
```

### Backend Specific
```bash
cd backend
go fmt ./...        # Format Go code
go vet ./...        # Go static analysis
go test ./...       # Run Go tests
go build -o server cmd/server/main.go  # Build binary
```

## Hook Behavior

### Successful Commit Flow
1. 🔍 Pre-commit checks start
2. 📝 Lint-staged runs (formatting/linting)
3. 🧪 Tests run (if code changes detected)
4. ✅ Commit proceeds

### Failed Commit Flow
- If linting fails: Commit blocked, files may be auto-fixed
- If tests fail: Commit blocked, manual fixes required
- If formatting fails: Commit blocked, manual fixes required

### Skip Tests Scenario
If only non-code files are changed (e.g., documentation, configuration), tests are skipped with message: "ℹ️ No code changes detected, skipping tests."

## Configuration Files

### package.json
```json
{
  "lint-staged": {
    "frontend/src/**/*.{js,jsx,ts,tsx}": [
      "cd frontend && npm run lint:fix"
    ],
    "backend/**/*.go": [
      "cd backend && go fmt",
      "cd backend && go vet"
    ]
  }
}
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
echo "🔍 Running pre-commit checks..."

# Run lint-staged for linting and formatting
echo "📝 Running linting and formatting..."
npx lint-staged

# Conditional testing based on changed files
if git diff --cached --name-only | grep -E "(frontend/.*\.(ts|tsx|js|jsx)|backend/.*\.go)$" > /dev/null; then
  echo "🧪 Running tests..."
  
  # Frontend tests if frontend files changed
  if git diff --cached --name-only | grep "frontend/" > /dev/null; then
    echo "🔍 Running frontend tests..."
    npm run test:frontend
  fi
  
  # Backend tests if backend files changed
  if git diff --cached --name-only | grep "backend/" > /dev/null; then
    echo "🔍 Running backend tests..."
    npm run test:backend
  fi
else
  echo "ℹ️  No code changes detected, skipping tests."
fi

echo "✅ Pre-commit checks passed!"
```

## Troubleshooting

### Common Issues

1. **Tests failing**: Fix the failing tests before committing
2. **Linting errors**: Run `npm run lint` to see all issues, some may be auto-fixed
3. **Go formatting issues**: Run `go fmt ./...` in the backend directory
4. **Husky not installed**: Run `npm run prepare` to set up Husky

### Bypassing Hooks (Not Recommended)
```bash
# Skip pre-commit hook (emergency only)
git commit --no-verify -m "commit message"
```

### Reinstalling Hooks
```bash
# Remove and reinstall hooks
rm -rf .husky
npm run prepare
```

## Best Practices

1. **Run tests locally** before committing to catch issues early
2. **Use meaningful commit messages** that describe the changes
3. **Keep commits focused** on single features or fixes
4. **Don't skip hooks** unless absolutely necessary
5. **Fix linting issues** rather than bypassing them

## Performance Considerations

- Tests only run for changed file types (frontend/backend)
- Lint-staged only processes staged files
- Parallel execution where possible
- Early exit on no code changes

This configuration ensures high code quality while maintaining developer productivity through intelligent selective testing and formatting.