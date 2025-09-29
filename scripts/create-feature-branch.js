#!/usr/bin/env node

/**
 * Feature Branch Creation Script with Linear Integration
 * Creates a new feature branch and optionally creates a Linear issue
 *
 * Usage:
 *   node scripts/create-feature-branch.js "feature-name" "Feature description"
 *   node scripts/create-feature-branch.js --linear "feature-name" "Feature description"
 */

const { execSync } = require('child_process');
const readline = require('readline');

const args = process.argv.slice(2);
const useLinear = args.includes('--linear');
const featureName = args.find(arg => !arg.startsWith('--') && arg === args[args.indexOf('--linear') ? args.indexOf('--linear') + 1 : 0]) || args[useLinear ? 1 : 0];
const featureDescription = args.slice(useLinear ? 2 : 1).join(' ');

if (!featureName) {
  console.error('❌ Feature name is required');
  console.log('Usage: node scripts/create-feature-branch.js [--linear] "feature-name" "Feature description"');
  process.exit(1);
}

// Validate feature name (kebab-case)
const validNameRegex = /^[a-z0-9-]+$/;
if (!validNameRegex.test(featureName)) {
  console.error('❌ Feature name must be in kebab-case (lowercase letters, numbers, and hyphens only)');
  console.log('Example: feature-authentication, bugfix-login-error');
  process.exit(1);
}

console.log('🔧 Creating feature branch...\n');

try {
  // Ensure we're on main and up to date
  console.log('📥 Updating main branch...');
  execSync('git checkout main', { stdio: 'inherit' });
  execSync('git pull origin main', { stdio: 'inherit' });

  // Create feature branch
  const branchName = `feature/${featureName}`;
  console.log(`\n🌿 Creating branch: ${branchName}`);
  execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

  console.log(`\n✅ Feature branch created: ${branchName}`);
  console.log(`📝 Description: ${featureDescription || 'No description provided'}`);

  // Create a branch info file
  const branchInfo = {
    name: branchName,
    description: featureDescription,
    createdAt: new Date().toISOString(),
    baseBranch: 'main'
  };

  console.log('\n📋 Branch Information:');
  console.log(JSON.stringify(branchInfo, null, 2));

  if (useLinear) {
    console.log('\n🎯 Linear Integration:');
    console.log('To create a Linear issue, run:');
    console.log(`  linear issue create --title "${featureName}" --description "${featureDescription}"`);
    console.log('\nOr manually create an issue at: https://linear.app');
  }

  console.log('\n📌 Next Steps:');
  console.log('1. Make your changes');
  console.log('2. Commit your changes: git add . && git commit -m "Your message"');
  console.log('3. Push your branch: git push -u origin ' + branchName);
  console.log('4. Create a Pull Request to main');
  console.log('5. After approval, merge to main\n');

} catch (error) {
  console.error('❌ Failed to create feature branch:', error.message);
  process.exit(1);
}