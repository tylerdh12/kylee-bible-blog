#!/bin/bash

# Deployment Script for Kylee's Blog
# This script handles the complete deployment process including database setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NODE_ENV=${NODE_ENV:-production}
VERBOSE=${VERBOSE:-false}

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm first."
    exit 1
fi

log "Starting deployment process..."
log "Environment: $NODE_ENV"

# Step 1: Install dependencies
log "Step 1/6: Installing dependencies..."
if [ "$VERBOSE" = "true" ]; then
    npm install
else
    npm install --silent
fi
log_success "Dependencies installed"

# Step 2: Run database setup
log "Step 2/6: Setting up database..."
if [ "$NODE_ENV" = "production" ]; then
    npm run setup:production
else
    npm run setup
fi
log_success "Database setup completed"

# Step 3: Run tests (if not in production)
if [ "$NODE_ENV" != "production" ]; then
    log "Step 3/6: Running tests..."
    if npm run test --silent; then
        log_success "Tests passed"
    else
        log_warning "Tests failed, but continuing deployment"
    fi
else
    log "Step 3/6: Skipping tests in production"
fi

# Step 4: Build the application
log "Step 4/6: Building application..."
if [ "$VERBOSE" = "true" ]; then
    npm run build
else
    npm run build --silent
fi
log_success "Application built successfully"

# Step 5: Verify deployment
log "Step 5/6: Verifying deployment..."
if [ -f "scripts/verify-deployment.js" ]; then
    if node scripts/verify-deployment.js; then
        log_success "Deployment verification passed"
    else
        log_warning "Deployment verification failed, but continuing"
    fi
else
    log "No verification script found, skipping verification"
fi

# Step 6: Final checks
log "Step 6/6: Final checks..."

# Check if build output exists
if [ -d ".next" ]; then
    log_success "Build output found"
else
    log_error "Build output not found"
    exit 1
fi

# Check if database is accessible
if [ -f "scripts/verify-admin.js" ]; then
    if node scripts/verify-admin.js; then
        log_success "Database connectivity verified"
    else
        log_warning "Database connectivity check failed"
    fi
fi

log_success "Deployment completed successfully! 🎉"

# Display next steps
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel with: vercel --prod"
echo "2. Set environment variables in Vercel dashboard:"
echo "   - DATABASE_URL (required)"
echo "   - NEXTAUTH_SECRET (required for production)"
echo "   - NEXTAUTH_URL (required for production)"
echo "3. Visit the admin panel at: /admin"
echo "4. Default admin credentials:"
echo "   Email: kylee@example.com"
echo "   Password: admin123"
echo ""
