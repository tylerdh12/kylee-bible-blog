# Development Workflow Guide

This document outlines the comprehensive development workflow for Kylee's Bible Blog application, including branching strategies, deployment processes, and automation tools.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Workflow Automation](#workflow-automation)
- [Branching Strategy](#branching-strategy)
- [Development Workflow](#development-workflow)
- [Deployment Process](#deployment-process)
- [Git Hooks](#git-hooks)
- [Linear Integration](#linear-integration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Management](#environment-management)
- [Best Practices](#best-practices)

## Overview

Our workflow system ensures code quality, maintains project tracking through Linear, and provides automated deployment across multiple environments (development, staging, production).

### Key Features

- ✅ Automated branch creation with Linear integration
- ✅ Pre-commit hooks for code quality enforcement
- ✅ Automated PR creation with templates
- ✅ Multi-environment deployment (dev, staging, prod)
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Database migration management
- ✅ Admin user creation for production

## Prerequisites

### Required

- Node.js >= 18.0.0
- Git
- npm or yarn
- Vercel CLI (for deployments)

### Optional but Recommended

- Linear CLI: `npm install -g @linear/cli`
- GitHub CLI: `brew install gh` (macOS) or [cli.github.com](https://cli.github.com/)

### Initial Setup

```bash
# Install dependencies
npm install

# Set up git hooks
npm run hooks:setup

# Configure Linear (optional)
npm install -g @linear/cli
linear auth

# Configure GitHub CLI (optional)
gh auth login
```

## Workflow Automation

We provide comprehensive workflow automation scripts to streamline development.

### Quick Start

```bash
# Create a new feature with full workflow
npm run workflow:feature

# Create a pull request
npm run workflow:pr

# Check workflow status
npm run workflow:status

# Get help
npm run workflow:help
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run workflow:feature` | Creates a new feature branch with Linear issue |
| `npm run workflow:pr` | Creates a PR with automated template |
| `npm run workflow:deploy` | Interactive deployment wizard |
| `npm run workflow:status` | Shows current workflow status |
| `npm run workflow:help` | Shows comprehensive help |

## Branching Strategy

### Branch Types

We follow a Git Flow-inspired branching strategy:

- **main**: Production-ready code (protected)
- **develop**: Integration branch for features (staging)
- **feature/**: New features
- **bugfix/**: Bug fixes
- **hotfix/**: Critical production fixes
- **release/**: Release preparation

### Branch Naming Convention

Branches must follow this pattern:

```
<type>/<issue-id>-<description>
```

Examples:
- `feature/KYL-123-user-authentication`
- `bugfix/KYL-456-fix-login-error`
- `hotfix/KYL-789-critical-security-patch`

### Creating Branches

**Option 1: Automated (Recommended)**

```bash
npm run workflow:feature
```

This will:
1. Create a Linear issue automatically
2. Create a properly named git branch
3. Set up branch metadata
4. Display next steps

**Option 2: Manual**

```bash
npm run branch:create "feature-name" "Feature description"
```

## Development Workflow

### Step-by-Step Process

#### 1. Start a New Feature

```bash
npm run workflow:feature
```

Follow the prompts to create:
- Linear issue (if CLI installed)
- Git branch with proper naming
- Branch metadata for tracking

#### 2. Make Changes

```bash
# Make your code changes
# The pre-commit hook will automatically:
# - Run linter
# - Run tests
# - Check branch naming
# - Remind about Linear issues
```

#### 3. Commit Changes

```bash
# With Linear issue reference (recommended)
git add .
git commit -m "KYL-123: Add user authentication"

# Without Linear (if not available)
git commit -m "Add user authentication"
```

The prepare-commit-msg hook will add helpful hints about Linear issues.

#### 4. Push Changes

```bash
git push -u origin <branch-name>
```

#### 5. Create Pull Request

```bash
npm run workflow:pr
```

This will:
- Generate PR with template
- Include commit history
- Reference Linear issue
- Add checklist

#### 6. Deploy to Staging

```bash
npm run deploy:staging
```

Or push to `develop` branch to trigger automatic staging deployment.

#### 7. Review and Merge

- Get code review approval
- Ensure all checks pass
- Merge to main via GitHub

#### 8. Production Deployment

Merging to `main` triggers automatic production deployment via CI/CD.

## Deployment Process

### Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | Any | Local | Local development |
| Staging | develop | staging-kylee-blog.vercel.app | Testing |
| Production | main | kylee-bible-blog.vercel.app | Live site |

### Manual Deployment

```bash
# Development build
npm run deploy:dev

# Staging deployment
npm run deploy:staging

# Production deployment (use with caution)
npm run deploy:production
```

### Automated Deployment

- **Staging**: Automatic on push to `develop` branch
- **Production**: Automatic on push to `main` branch

### Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Tested on staging environment
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Admin users created (if needed)

## Git Hooks

### Pre-Commit Hook

Runs before every commit:

- ✅ Lints code with ESLint
- ✅ Runs unit tests
- ✅ Validates branch naming
- ✅ Checks for package.json/lock consistency
- ✅ Reminds about Linear integration

### Prepare-Commit-Msg Hook

Runs when preparing commit message:

- Adds helpful comments about Linear issues
- Includes branch context
- Provides commit message examples

### Post-Commit Hook

Runs after successful commit:

- Detects Linear issue references
- Provides issue update reminders
- Links commits to issues

### Installing Hooks

```bash
# Install all hooks
npm run hooks:setup

# Hooks are automatically installed on npm install
```

### Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hook (NOT recommended)
git commit --no-verify -m "Your message"
```

## Linear Integration

### Setup

```bash
# Install Linear CLI
npm install -g @linear/cli

# Authenticate
linear auth
```

### Usage

```bash
# Create an issue
npm run linear:create-issue "Issue title" "Description"

# List issues
npm run linear:list

# Get help
npm run linear:help
```

### Commit Message Format

Reference Linear issues in commits:

```bash
git commit -m "KYL-123: Add feature description"
```

This automatically links commits to Linear issues.

### Workflow Integration

When using `npm run workflow:feature`, Linear issues are created automatically if the CLI is available.

## CI/CD Pipeline

### GitHub Actions Workflows

#### Production CI/CD (main branch)

`.github/workflows/ci.yml`

Runs on push/PR to `main`:

1. **Test Job**:
   - Runs on Node.js 18.x and 20.x
   - Installs dependencies
   - Generates Prisma client
   - Runs unit tests with coverage
   - Builds application
   - Uploads coverage reports

2. **E2E Tests Job**:
   - Installs Playwright
   - Runs end-to-end tests
   - Uploads test reports

3. **Deploy Job** (main branch only):
   - Deploys to Vercel production
   - Requires: VERCEL_TOKEN, ORG_ID, PROJECT_ID secrets

#### Staging Deployment (develop branch)

`.github/workflows/staging.yml`

Runs on push/PR to `develop`:

1. Runs tests
2. Builds application
3. Deploys to staging environment

### Required Secrets

Configure in GitHub repository settings:

- `VERCEL_TOKEN`: Vercel authentication token
- `ORG_ID`: Vercel organization ID
- `PROJECT_ID`: Vercel project ID
- `GITHUB_TOKEN`: Automatically provided by GitHub

## Environment Management

### Environment Files

- `.env.development`: Local development
- `.env.staging`: Staging environment
- `.env.production`: Production environment
- `.env.example`: Template for all environments

### Environment Variables

#### Development

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="development-secret"
NEXTAUTH_SECRET="development-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
ALLOW_ADMIN_SETUP="true"
NODE_ENV="development"
```

#### Staging/Production

Configure in Vercel dashboard:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret (min 32 chars)
- `NEXTAUTH_SECRET`: Strong random secret
- `NEXTAUTH_URL`: Application URL
- `ALLOW_ADMIN_SETUP`: "false" (security)

### Database Management

#### Migrations

```bash
# Generate Prisma client
npm run migrate

# Deploy migrations to production
npm run migrate:deploy
```

#### Admin User Creation

```bash
# Create admin user in production
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="secure-password" \
ADMIN_NAME="Admin Name" \
npm run create-admin
```

## Best Practices

### Code Quality

1. **Always run tests** before committing
2. **Follow linting rules** - pre-commit hooks enforce this
3. **Write meaningful commit messages** - reference Linear issues
4. **Keep commits atomic** - one logical change per commit
5. **Update documentation** - document new features/changes

### Branching

1. **Always branch from main** for features
2. **Keep branches short-lived** - merge frequently
3. **Use descriptive names** - follow naming conventions
4. **Delete merged branches** - keep repository clean
5. **Rebase instead of merge** when appropriate

### Pull Requests

1. **Use PR template** - filled by automation
2. **Request review** from team members
3. **Link Linear issues** - reference in PR description
4. **Update tests** - add/update tests for changes
5. **Test on staging** before merging to main

### Deployments

1. **Test on staging first** - never skip staging
2. **Deploy during low traffic** - for production
3. **Monitor after deployment** - watch for errors
4. **Have rollback plan** - know how to revert
5. **Communicate deployments** - notify team

### Security

1. **Never commit secrets** - use environment variables
2. **Rotate secrets regularly** - especially for production
3. **Use strong passwords** - min 12 characters
4. **Review dependencies** - check for vulnerabilities
5. **Keep packages updated** - security patches

### Database

1. **Always backup** before migrations
2. **Test migrations** on staging first
3. **Use transactions** for data changes
4. **Document schema changes** - in PR descriptions
5. **Plan for rollbacks** - reversible migrations

## Troubleshooting

### Common Issues

#### Git Hooks Not Running

```bash
# Reinstall hooks
npm run hooks:setup

# Check hook permissions
ls -l .git/hooks/
```

#### Linear CLI Not Working

```bash
# Reinstall Linear CLI
npm install -g @linear/cli

# Re-authenticate
linear auth
```

#### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### Test Failures

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test
npm test -- path/to/test.js
```

### Getting Help

- **Workflow Help**: `npm run workflow:help`
- **Linear Help**: `npm run linear:help`
- **GitHub Issues**: [Report bugs/issues](https://github.com/your-repo/issues)

## Quick Reference

### Essential Commands

```bash
# Setup
npm install                    # Install dependencies
npm run hooks:setup           # Install git hooks

# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm test                       # Run tests
npm run lint                   # Lint code

# Workflow
npm run workflow:feature       # Create feature
npm run workflow:pr           # Create PR
npm run workflow:status       # Check status

# Deployment
npm run deploy:dev            # Deploy to dev
npm run deploy:staging        # Deploy to staging
npm run deploy:production     # Deploy to production

# Linear
npm run linear:create-issue   # Create issue
npm run linear:list           # List issues

# Database
npm run migrate               # Run migrations
npm run create-admin          # Create admin user
```

## Support

For questions or issues:

1. Check this documentation
2. Run `npm run workflow:help`
3. Check existing GitHub issues
4. Create a new issue if needed

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0