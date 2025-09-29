# Contributing to Kylee Bible Blog

Thank you for your interest in contributing to the Kylee Bible Blog! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup

1. Fork the repository

2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kylee-bible-blog.git
   cd kylee-bible-blog
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up your local environment:
   ```bash
   cp .env.example .env
   npm run setup
   ```

5. Create an admin user:
   ```bash
   ADMIN_EMAIL="dev@example.com" ADMIN_PASSWORD="DevPass123!" ADMIN_NAME="Dev User" npm run create-admin
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## 💻 Development Workflow

### 1. Create a Linear Issue

Before starting work, create a Linear issue:

```bash
npm run linear:create-issue "Feature name" "Detailed description"
```

### 2. Create a Feature Branch

Create a new branch for your work:

```bash
npm run branch:create feature-name "Brief description"
```

This will:
- Update your local main branch
- Create a new feature branch from main
- Display next steps

### 3. Make Your Changes

- Write clean, well-documented code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes

Run all tests before committing:

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test:all

# Check code coverage
npm run test:coverage
```

### 5. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add user profile page (LIN-123)"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

### 6. Push Your Branch

```bash
git push -u origin feature/feature-name
```

### 7. Create a Pull Request

1. Go to GitHub and create a Pull Request to `develop`
2. Fill out the PR template completely
3. Link the Linear issue
4. Wait for CI checks to pass
5. Request review from maintainers

## 🔄 Pull Request Process

### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Linear issue is linked
- [ ] No merge conflicts
- [ ] PR description is complete

### Review Process

1. **Automated Checks**: CI will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, a maintainer will merge

### After Merge

1. Your PR will be merged to `develop`
2. It will be deployed to staging automatically
3. After testing, it will be included in the next production release

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use meaningful variable and function names
- Write JSDoc comments for functions
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Keep components in appropriate directories

### File Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── types/           # TypeScript types
└── styles/          # CSS/Tailwind styles
```

### Styling

- Use Tailwind CSS for styling
- Follow existing component patterns
- Ensure responsive design
- Support dark mode

### API Routes

- Use proper HTTP methods
- Validate input data
- Handle errors gracefully
- Return appropriate status codes
- Document endpoints

## 🧪 Testing Requirements

### Unit Tests

- Write tests for all new functions
- Use Jest and React Testing Library
- Aim for >80% code coverage
- Test edge cases

Example:
```typescript
describe('MyComponent', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

### E2E Tests

- Write E2E tests for user flows
- Use Playwright
- Test critical paths
- Include error scenarios

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments to functions
- Document complex logic
- Include usage examples
- Keep comments up to date

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying dependencies
- Updating requirements

### API Documentation

Document API endpoints:
- Method and path
- Request parameters
- Response format
- Error codes
- Usage examples

## 🐛 Bug Reports

When reporting bugs:

1. Create a Linear issue
2. Include steps to reproduce
3. Provide expected vs actual behavior
4. Include environment details
5. Add screenshots if relevant

## 💡 Feature Requests

When requesting features:

1. Create a Linear issue
2. Describe the use case
3. Explain the benefit
4. Provide examples if possible
5. Discuss in the issue before implementing

## 🔒 Security

### Reporting Security Issues

**Do not** create public issues for security vulnerabilities.

Instead:
1. Email security concerns privately
2. Provide detailed information
3. Allow time for fixes before disclosure

### Security Best Practices

- Never commit secrets or credentials
- Use environment variables
- Validate all input
- Sanitize user data
- Follow OWASP guidelines

## ✅ Checklist for Contributors

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for features
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Linear issue linked
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Branch is up to date with develop

## 📞 Getting Help

If you need help:

1. Check existing documentation
2. Search GitHub Issues
3. Search Linear issues
4. Ask in pull request comments
5. Contact maintainers

## 🎉 Recognition

Contributors will be:
- Listed in the project
- Credited in release notes
- Recognized for their work

Thank you for contributing to Kylee Bible Blog!