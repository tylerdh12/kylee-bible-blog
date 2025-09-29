#!/usr/bin/env node

/**
 * Multi-environment deployment script
 * Handles deployments to development, staging, and production environments
 *
 * Usage:
 *   npm run deploy:dev
 *   npm run deploy:staging
 *   npm run deploy:production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get environment from command line argument
const environment = process.argv[2] || 'development';
const validEnvironments = ['development', 'staging', 'production'];

if (!validEnvironments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.log(`Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

console.log(`🚀 Deploying to ${environment}...`);

// Load environment-specific configuration
const envFile = path.join(__dirname, '..', `.env.${environment}`);
if (!fs.existsSync(envFile)) {
  console.warn(`⚠️  No environment file found at ${envFile}`);
  console.warn('⚠️  Using default configuration');
}

// Deployment steps
const steps = [
  {
    name: 'Check Git Status',
    command: 'git status --porcelain',
    validate: (output) => {
      if (environment === 'production' && output.trim()) {
        throw new Error('Working directory is not clean. Commit or stash changes before deploying to production.');
      }
    }
  },
  {
    name: 'Run Tests',
    command: 'npm test -- --watchAll=false',
    skipOnFail: environment !== 'production'
  },
  {
    name: 'Run Linter',
    command: 'npm run lint',
    skipOnFail: environment !== 'production'
  },
  {
    name: 'Build Application',
    command: `NODE_ENV=${environment === 'development' ? 'development' : 'production'} npm run build`,
    skipOnFail: false
  }
];

// Execute deployment steps
let currentStep = 1;
for (const step of steps) {
  console.log(`\n[${currentStep}/${steps.length}] ${step.name}...`);

  try {
    const output = execSync(step.command, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    if (step.validate) {
      step.validate(output);
    }

    console.log(`✅ ${step.name} completed`);
  } catch (error) {
    console.error(`❌ ${step.name} failed:`, error.message);

    if (!step.skipOnFail) {
      console.error('🛑 Deployment aborted due to critical failure');
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing despite failure...');
    }
  }

  currentStep++;
}

// Environment-specific deployment
if (environment === 'development') {
  console.log('\n✅ Development build completed successfully');
  console.log('💡 Run "npm run dev" to start the development server');
} else {
  console.log(`\n📦 Deploying to Vercel (${environment})...`);

  try {
    const vercelArgs = environment === 'production' ? '--prod' : '';
    execSync(`vercel ${vercelArgs}`, { stdio: 'inherit' });
    console.log(`\n🎉 Successfully deployed to ${environment}!`);
  } catch (error) {
    console.error(`❌ Vercel deployment failed:`, error.message);
    process.exit(1);
  }
}