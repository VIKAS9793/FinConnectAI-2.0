# FinConnectAI 2.0 Development Setup Guide

This guide will help you set up your development environment for FinConnectAI 2.0.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [IDE Configuration](#ide-configuration)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Code Style](#code-style)
8. [Git Workflow](#git-workflow)
9. [Useful Scripts](#useful-scripts)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **Node.js**: 18.x LTS or later
- **npm**: 9.x or later, or Yarn 1.22+
- **Git**: Latest stable version
- **Docker**: 20.10+ (for containerized development)
- **Database**: PostgreSQL 13+ or Docker

### Recommended Tools

- **Code Editor**: VS Code (recommended) or WebStorm
- **Database Client**: DBeaver, TablePlus, or pgAdmin
- **API Client**: Postman or Insomnia
- **Version Control**: GitKraken or GitHub Desktop

## Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/VIKAS9793/FinConnectAI-2.0.git
cd FinConnectAI-2.0

# Install Node.js dependencies
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Generate a secure JWT secret
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL in Docker
docker run --name finconnect-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:13-alpine

# Create database
docker exec -it finconnect-db psql -U postgres -c "CREATE DATABASE finconnect_development;"
```

#### Option B: Local Installation

1. Install PostgreSQL 13+
2. Create a database:
   ```sql
   CREATE DATABASE finconnect_development;
   CREATE USER finconnect WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE finconnect_development TO finconnect;
   ```

### 4. Run Migrations

```bash
# Run database migrations
npm run db:migrate

# Seed development data (if available)
npm run db:seed
```

## IDE Configuration

### VS Code Setup

1. Install recommended extensions:
   ```bash
   code --install-extension dbaeumer.vscode-eslint
   code --install-extension esbenp.prettier-vscode
   code --install-extension ms-vscode.vscode-typescript-next
   code --install-extension eamodio.gitlens
   ```

2. Recommended settings (`.vscode/settings.json`):
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "eslint.validate": ["javascript", "typescript"],
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

## Development Workflow

### Starting the Development Server

```bash
# Start development server with hot-reload
npm run dev
```

The application will be available at `http://localhost:3001`

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the [code style](#code-style)

3. Run tests:
   ```bash
   npm test
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. Push and create a pull request

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

1. Unit tests should be placed in `src/__tests__/`
2. Test files should be named `*.test.ts` or `*.spec.ts`
3. Use the following testing libraries:
   - `jest` for test runner
   - `@testing-library/react` for React components
   - `supertest` for API testing

Example test:
```typescript
describe('TransactionService', () => {
  it('should process a valid transaction', async () => {
    const result = await transactionService.process(validTransaction);
    expect(result).toHaveProperty('status', 'success');
  });
});
```

## Debugging

### VS Code Debug Configuration

Add this to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "port": 9229
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "preLaunchTask": "tsc: build - tsconfig.json",
      "sourceMaps": true,
      "smartStep": true,
      "internalConsoleOptions": "openOnSessionStart"
    }
  ]
}
```

### Debugging Tests

1. Set breakpoints in your test or source files
2. Run the "Debug Tests" configuration
3. Use the debug toolbar to step through code

## Code Style

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Formatting

```bash
# Run Prettier
npm run format
```

### Type Checking

```bash
# Check TypeScript types
npm run type-check
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Example:
```
feat(transactions): add transaction validation

- Add amount validation
- Add merchant verification
- Add currency validation

Closes #123
```

## Git Workflow

### Branch Naming

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Update documentation if needed
4. Add tests for new features
5. Run all tests and ensure they pass
6. Create a pull request to `main`
7. Request reviews from at least one team member
8. Address review comments
9. Squash and merge when approved

## Useful Scripts

```bash
# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run migrations
npm run db:migrate

# Run linter
npm run lint

# Run formatter
npm run format

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Check for outdated dependencies
npm outdated

# Update dependencies
npm update
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection string format
# Should be: postgresql://user:password@host:port/database
```

#### Dependency Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Getting Help

If you encounter any issues:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
2. Search the [GitHub Issues](https://github.com/VIKAS9793/FinConnectAI-2.0/issues)
3. Ask for help in the team's Slack channel
4. Contact the maintainers if needed
