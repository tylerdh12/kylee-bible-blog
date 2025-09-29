#!/usr/bin/env node

/**
 * Git Hooks Setup Script
 * Installs git hooks for workflow automation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOOKS_SOURCE = path.join(__dirname, 'git-hooks');
const HOOKS_DEST = path.join(__dirname, '..', '.git', 'hooks');

console.log('🎣 Setting up Git hooks for workflow automation...\n');

// Check if .git directory exists
if (!fs.existsSync(path.join(__dirname, '..', '.git'))) {
  console.error('❌ Not a git repository');
  process.exit(1);
}

// Create hooks directory if it doesn't exist
if (!fs.existsSync(HOOKS_DEST)) {
  fs.mkdirSync(HOOKS_DEST, { recursive: true });
}

// Hooks to install
const hooks = ['pre-commit', 'prepare-commit-msg', 'post-commit'];

let installedCount = 0;
let skippedCount = 0;

for (const hook of hooks) {
  const sourcePath = path.join(HOOKS_SOURCE, hook);
  const destPath = path.join(HOOKS_DEST, hook);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Hook source not found: ${hook}`);
    continue;
  }

  try {
    // Read source hook
    const hookContent = fs.readFileSync(sourcePath, 'utf8');

    // Check if hook already exists
    if (fs.existsSync(destPath)) {
      const existingContent = fs.readFileSync(destPath, 'utf8');
      if (existingContent === hookContent) {
        console.log(`✓ ${hook} already installed (up to date)`);
        skippedCount++;
        continue;
      } else {
        // Backup existing hook
        const backupPath = `${destPath}.backup`;
        fs.copyFileSync(destPath, backupPath);
        console.log(`📦 Backed up existing ${hook} to ${hook}.backup`);
      }
    }

    // Write hook
    fs.writeFileSync(destPath, hookContent);

    // Make executable
    fs.chmodSync(destPath, '755');

    console.log(`✅ Installed ${hook}`);
    installedCount++;
  } catch (error) {
    console.error(`❌ Failed to install ${hook}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Installed: ${installedCount}`);
console.log(`   ✓  Skipped: ${skippedCount}`);
console.log(`   Total: ${hooks.length}`);

console.log(`\n🎯 Git hooks are now active!`);
console.log(`\nHooks enabled:`);
console.log(`  • pre-commit: Runs linter and tests before committing`);
console.log(`  • prepare-commit-msg: Adds helpful commit message hints`);
console.log(`  • post-commit: Links commits to Linear issues automatically`);

console.log(`\n💡 Recommended: Install Linear CLI for full integration`);
console.log(`   1. npm install -g @linear/cli`);
console.log(`   2. linear auth`);
console.log(`\n📚 More info: npm run workflow:help`);