#!/usr/bin/env node

/**
 * Linear Integration Helper Script
 * Provides utilities for integrating with Linear for project management
 *
 * Features:
 * - Create issues from command line
 * - Link commits to issues
 * - Update issue status
 * - Generate release notes from completed issues
 *
 * Setup:
 * 1. Install Linear CLI: npm install -g @linear/cli
 * 2. Authenticate: linear auth
 * 3. Set up Linear webhook in Linear settings
 *
 * Usage:
 *   node scripts/linear-integration.js create-issue "Issue title" "Description"
 *   node scripts/linear-integration.js list-issues
 *   node scripts/linear-integration.js update-status <issue-id> <status>
 */

const { execSync } = require('child_process');

const command = process.argv[2];
const args = process.argv.slice(3);

// Check if Linear CLI is installed
function checkLinearCLI() {
  try {
    execSync('linear --version', { stdio: 'pipe' });
    return true;
  } catch {
    console.error('❌ Linear CLI not found');
    console.log('📦 Install with: npm install -g @linear/cli');
    console.log('🔑 Then authenticate with: linear auth');
    return false;
  }
}

// Create a new Linear issue
function createIssue(title, description = '') {
  console.log('🎯 Creating Linear issue...\n');

  try {
    const result = execSync(
      `linear issue create --title "${title}" --description "${description}"`,
      { encoding: 'utf8' }
    );

    console.log('✅ Issue created successfully!');
    console.log(result);
  } catch (error) {
    console.error('❌ Failed to create issue:', error.message);
    process.exit(1);
  }
}

// List issues
function listIssues() {
  console.log('📋 Listing Linear issues...\n');

  try {
    const result = execSync('linear issue list', { encoding: 'utf8', stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to list issues:', error.message);
    process.exit(1);
  }
}

// Update issue status
function updateStatus(issueId, status) {
  console.log(`🔄 Updating issue ${issueId} to status: ${status}\n`);

  try {
    execSync(
      `linear issue update ${issueId} --state "${status}"`,
      { stdio: 'inherit' }
    );

    console.log('✅ Issue status updated successfully!');
  } catch (error) {
    console.error('❌ Failed to update issue:', error.message);
    process.exit(1);
  }
}

// Show help
function showHelp() {
  console.log(`
📚 Linear Integration Helper

Usage:
  node scripts/linear-integration.js <command> [args]

Commands:
  create-issue <title> <description>  Create a new Linear issue
  list-issues                         List all issues
  update-status <id> <status>         Update issue status
  help                                Show this help message

Examples:
  node scripts/linear-integration.js create-issue "Add authentication" "Implement JWT auth"
  node scripts/linear-integration.js list-issues
  node scripts/linear-integration.js update-status ABC-123 "In Progress"

Setup Instructions:
  1. Install Linear CLI: npm install -g @linear/cli
  2. Authenticate: linear auth
  3. Configure Linear webhook in your Linear workspace settings

For more information, visit: https://developers.linear.app/docs/cli
  `);
}

// Main execution
if (!checkLinearCLI() && command !== 'help') {
  process.exit(1);
}

switch (command) {
  case 'create-issue':
    if (args.length < 1) {
      console.error('❌ Title is required');
      console.log('Usage: node scripts/linear-integration.js create-issue <title> [description]');
      process.exit(1);
    }
    createIssue(args[0], args[1] || '');
    break;

  case 'list-issues':
    listIssues();
    break;

  case 'update-status':
    if (args.length < 2) {
      console.error('❌ Issue ID and status are required');
      console.log('Usage: node scripts/linear-integration.js update-status <issue-id> <status>');
      process.exit(1);
    }
    updateStatus(args[0], args[1]);
    break;

  case 'help':
  default:
    showHelp();
    break;
}