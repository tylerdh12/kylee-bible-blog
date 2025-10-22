#!/usr/bin/env node

/**
 * Comprehensive Workflow Automation System
 * Enforces development workflow and integrates with Linear
 *
 * Features:
 * - Automated branch creation with Linear integration
 * - Commit validation and Linear issue linking
 * - PR creation with automated templates
 * - Deployment workflow management
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const question = (query) =>
	new Promise((resolve) => rl.question(query, resolve));

// Check if Linear CLI is available
function hasLinearCLI() {
	try {
		execSync('linear --version', { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

// Check if gh CLI is available
function hasGHCLI() {
	try {
		execSync('gh --version', { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

// Create a new feature with full workflow
async function createFeatureWorkflow() {
	console.log('🚀 Starting Feature Workflow...\n');

	// Check prerequisites
	const hasLinear = hasLinearCLI();
	const hasGH = hasGHCLI();

	if (!hasLinear) {
		console.log(
			'⚠️  Linear CLI not installed (optional but recommended)'
		);
		console.log(
			'   Install with: npm install -g @linear/cli\n'
		);
	}

	// Get feature details
	const featureName = await question(
		'📝 Feature name (kebab-case): '
	);
	if (!featureName || !/^[a-z0-9-]+$/.test(featureName)) {
		console.error(
			'❌ Invalid feature name. Use kebab-case (e.g., user-authentication)'
		);
		process.exit(1);
	}

	const featureDescription = await question(
		'📄 Feature description: '
	);
	const featureType =
		(await question(
			'🏷️  Type (feature/bugfix/hotfix) [feature]: '
		)) || 'feature';

	rl.close();

	console.log('\n🔧 Creating workflow...\n');

	// Step 1: Create Linear issue (if available)
	let linearIssueId = null;
	if (hasLinear) {
		try {
			console.log('1️⃣  Creating Linear issue...');
			// Escape special characters in feature name and description
			const escapedFeatureName = featureName
				.replace(/"/g, '\\"')
				.replace(/'/g, "\\'");
			const escapedFeatureDescription = featureDescription
				.replace(/"/g, '\\"')
				.replace(/'/g, "\\'");

			const result = execSync(
				`linear issue create --title "${escapedFeatureName.replace(
					/-/g,
					' '
				)}" --description "${escapedFeatureDescription}"`,
				{ encoding: 'utf8' }
			);

			// Extract issue ID from result
			const match = result.match(/([A-Z]+-\d+)/);
			if (match) {
				linearIssueId = match[1];
				console.log(
					`   ✅ Linear issue created: ${linearIssueId}\n`
				);
			}
		} catch (error) {
			console.log(
				'   ⚠️  Could not create Linear issue automatically\n'
			);
		}
	} else {
		console.log(
			'1️⃣  ⏭️  Skipping Linear issue creation (CLI not installed)\n'
		);
	}

	// Step 2: Create git branch
	try {
		console.log('2️⃣  Creating git branch...');
		execSync('git checkout main', { stdio: 'pipe' });
		execSync('git pull origin main', { stdio: 'pipe' });

		const branchPrefix = linearIssueId
			? `${featureType}/${linearIssueId.toLowerCase()}-`
			: `${featureType}/`;
		const branchName = `${branchPrefix}${featureName}`;

		// Escape branch name for shell command
		const escapedBranchName = branchName.replace(
			/[^a-zA-Z0-9\/\-_]/g,
			''
		);

		execSync(`git checkout -b ${escapedBranchName}`, {
			stdio: 'pipe',
		});
		console.log(`   ✅ Branch created: ${branchName}\n`);

		// Step 3: Create branch metadata file
		console.log('3️⃣  Creating branch metadata...');
		const metadata = {
			branchName,
			featureName,
			description: featureDescription,
			linearIssue: linearIssueId,
			createdAt: new Date().toISOString(),
			baseBranch: 'main',
		};

		const metadataDir = path.join(
			__dirname,
			'..',
			'.workflow'
		);
		if (!fs.existsSync(metadataDir)) {
			fs.mkdirSync(metadataDir, { recursive: true });
		}

		fs.writeFileSync(
			path.join(
				metadataDir,
				`${branchName.replace(/\//g, '-')}.json`
			),
			JSON.stringify(metadata, null, 2)
		);
		console.log('   ✅ Metadata saved\n');

		// Step 4: Display next steps
		console.log('🎉 Feature workflow initialized!\n');
		console.log('📋 Summary:');
		console.log(`   Branch: ${branchName}`);
		if (linearIssueId) {
			console.log(`   Linear Issue: ${linearIssueId}`);
		}
		console.log(`   Description: ${featureDescription}\n`);

		console.log('📌 Next Steps:');
		console.log('   1. Make your changes');
		console.log(
			`   2. Commit: git commit -m "${
				linearIssueId ? linearIssueId + ': ' : ''
			}Your commit message"`
		);
		console.log(
			`   3. Push: git push -u origin ${branchName}`
		);
		console.log('   4. Create PR: npm run workflow:pr');
		console.log('   5. Deploy to staging for testing');
		console.log('   6. Merge to main after approval\n');
	} catch (error) {
		console.error(
			'❌ Failed to create branch:',
			error.message
		);
		process.exit(1);
	}
}

// Create PR with template
async function createPRWorkflow() {
	console.log('📬 Creating Pull Request...\n');

	const hasGH = hasGHCLI();
	if (!hasGH) {
		console.error('❌ GitHub CLI not installed');
		console.log(
			'   Install with: brew install gh (macOS) or visit https://cli.github.com/'
		);
		process.exit(1);
	}

	try {
		const currentBranch = execSync(
			'git rev-parse --abbrev-ref HEAD',
			{ encoding: 'utf8' }
		).trim();

		if (
			currentBranch === 'main' ||
			currentBranch === 'develop'
		) {
			console.error(
				'❌ Cannot create PR from main/develop branch'
			);
			process.exit(1);
		}

		// Load metadata if available
		const metadataPath = path.join(
			__dirname,
			'..',
			'.workflow',
			`${currentBranch.replace(/\//g, '-')}.json`
		);
		let metadata = null;
		if (fs.existsSync(metadataPath)) {
			metadata = JSON.parse(
				fs.readFileSync(metadataPath, 'utf8')
			);
		}

		// Get commit log
		const commits = execSync(
			'git log main..HEAD --pretty=format:"- %s"',
			{ encoding: 'utf8' }
		);

		// Generate PR body
		const prBody = `## Description
${
	metadata ? metadata.description : 'Feature implementation'
}

## Changes
${commits}

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Tested on staging environment

## Linear Issue
${
	metadata && metadata.linearIssue
		? `Closes ${metadata.linearIssue}`
		: 'N/A'
}

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Environment variables documented (if added)

---
*Generated with workflow automation*`;

		const prTitle =
			metadata && metadata.linearIssue
				? `${
						metadata.linearIssue
				  }: ${metadata.featureName.replace(/-/g, ' ')}`
				: currentBranch.split('/').pop().replace(/-/g, ' ');

		// Create PR
		fs.writeFileSync('/tmp/pr-body.md', prBody);
		execSync(
			`gh pr create --title "${prTitle}" --body-file /tmp/pr-body.md --base main`,
			{ stdio: 'inherit' }
		);

		console.log('\n✅ Pull Request created successfully!');
	} catch (error) {
		console.error('❌ Failed to create PR:', error.message);
		process.exit(1);
	} finally {
		rl.close();
	}
}

// Deploy workflow
async function deployWorkflow() {
	console.log('🚀 Deployment Workflow...\n');

	const environment = await question(
		'🌍 Environment (dev/staging/production): '
	);

	if (
		!['dev', 'staging', 'production'].includes(environment)
	) {
		console.error('❌ Invalid environment');
		process.exit(1);
	}

	rl.close();

	console.log(`\n📦 Deploying to ${environment}...\n`);

	try {
		if (environment === 'production') {
			const confirm = await question(
				'⚠️  Deploy to PRODUCTION? (yes/no): '
			);
			if (confirm.toLowerCase() !== 'yes') {
				console.log('Cancelled');
				process.exit(0);
			}
		}

		// Validate environment to prevent command injection
		const validEnvironments = [
			'development',
			'staging',
			'production',
		];
		if (!validEnvironments.includes(environment)) {
			console.error(
				'❌ Invalid environment. Must be one of:',
				validEnvironments.join(', ')
			);
			process.exit(1);
		}

		execSync(`npm run deploy:${environment}`, {
			stdio: 'inherit',
		});
		console.log(
			`\n✅ Deployed to ${environment} successfully!`
		);
	} catch (error) {
		console.error('❌ Deployment failed:', error.message);
		process.exit(1);
	}
}

// Show workflow status
function workflowStatus() {
	console.log('📊 Workflow Status\n');

	try {
		const branch = execSync(
			'git rev-parse --abbrev-ref HEAD',
			{ encoding: 'utf8' }
		).trim();
		const status = execSync('git status --porcelain', {
			encoding: 'utf8',
		});

		console.log(`Current Branch: ${branch}`);
		console.log(
			`Status: ${
				status ? 'Modified files present' : 'Clean'
			}\n`
		);

		// Check for metadata
		const metadataPath = path.join(
			__dirname,
			'..',
			'.workflow',
			`${branch.replace(/\//g, '-')}.json`
		);
		if (fs.existsSync(metadataPath)) {
			const metadata = JSON.parse(
				fs.readFileSync(metadataPath, 'utf8')
			);
			console.log('Branch Metadata:');
			console.log(`  Feature: ${metadata.featureName}`);
			console.log(`  Description: ${metadata.description}`);
			if (metadata.linearIssue) {
				console.log(
					`  Linear Issue: ${metadata.linearIssue}`
				);
			}
			console.log(
				`  Created: ${new Date(
					metadata.createdAt
				).toLocaleString()}\n`
			);
		}

		// Check for recent commits
		const recentCommits = execSync('git log --oneline -5', {
			encoding: 'utf8',
		});
		console.log('Recent Commits:');
		console.log(recentCommits);
	} catch (error) {
		console.error(
			'❌ Error getting workflow status:',
			error.message
		);
	}
}

// Show help
function showHelp() {
	console.log(`
🔄 Workflow Automation System

Commands:
  feature         Create new feature with full workflow
  pr              Create pull request with template
  deploy          Deploy to specified environment
  status          Show current workflow status
  help            Show this help message

Usage:
  node scripts/workflow-automation.js <command>

Examples:
  node scripts/workflow-automation.js feature
  node scripts/workflow-automation.js pr
  node scripts/workflow-automation.js deploy

NPM Scripts:
  npm run workflow:feature     Create new feature
  npm run workflow:pr          Create PR
  npm run workflow:deploy      Deploy
  npm run workflow:status      Show status
  npm run workflow:help        Show help

Workflow Process:
  1. Create feature: npm run workflow:feature
  2. Make changes and commit (pre-commit hooks run automatically)
  3. Push changes: git push
  4. Create PR: npm run workflow:pr
  5. Deploy to staging: npm run deploy:staging
  6. Merge to main (triggers production deployment)

For more information, see: WORKFLOW.md
  `);
}

// Main execution
const command = process.argv[2] || 'help';

async function main() {
	switch (command) {
		case 'feature':
			await createFeatureWorkflow();
			break;
		case 'pr':
			await createPRWorkflow();
			break;
		case 'deploy':
			await deployWorkflow();
			break;
		case 'status':
			workflowStatus();
			break;
		case 'help':
		default:
			showHelp();
			break;
	}
}

main().catch((error) => {
	console.error('❌ Error:', error.message);
	process.exit(1);
});
