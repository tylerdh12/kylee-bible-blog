#!/usr/bin/env node

/**
 * Verify Vercel Environment Variables Setup
 * Checks if all required environment variables are properly configured
 */

console.log('🔍 Vercel Environment Variables Verification\n');

// Expected Neon database configuration
const EXPECTED_NEON_URL = "postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";
const EXPECTED_HOST = "ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech";
const EXPECTED_DATABASE = "neondb";

// Required environment variables
const requiredVars = {
	DATABASE_URL: {
		description: 'Neon PostgreSQL database URL',
		required: true,
		expected: EXPECTED_NEON_URL,
	},
	JWT_SECRET: {
		description: 'JWT authentication secret',
		required: true,
		minLength: 32,
	},
	NEXTAUTH_SECRET: {
		description: 'NextAuth.js secret',
		required: true,
		minLength: 32,
	},
	NEXTAUTH_URL: {
		description: 'NextAuth.js callback URL',
		required: true,
		format: 'https://your-app.vercel.app',
	},
	ALLOW_ADMIN_SETUP: {
		description: 'Allow admin user setup',
		required: false,
		expected: 'true',
	},
};

console.log('📋 Environment Variables Check:\n');

let allGood = true;
let criticalIssues = [];
let warnings = [];

for (const [varName, config] of Object.entries(requiredVars)) {
	const value = process.env[varName];
	const hasValue = !!value;
	
	console.log(`${hasValue ? '✅' : '❌'} ${varName}`);
	console.log(`   Description: ${config.description}`);
	
	if (!hasValue && config.required) {
		console.log(`   Status: ❌ MISSING (Required)`);
		criticalIssues.push(`Missing required variable: ${varName}`);
		allGood = false;
	} else if (!hasValue && !config.required) {
		console.log(`   Status: ⚠️  Not set (Optional)`);
		warnings.push(`Optional variable not set: ${varName}`);
	} else {
		console.log(`   Status: ✅ Set`);
		
		// Validate specific configurations
		if (varName === 'DATABASE_URL' && value) {
			const isCorrectFormat = value.startsWith('postgresql://');
			const hasCorrectHost = value.includes(EXPECTED_HOST);
			const hasCorrectDatabase = value.includes(`/${EXPECTED_DATABASE}`);
			const hasSSL = value.includes('sslmode=require');
			
			console.log(`   Format: ${isCorrectFormat ? '✅' : '❌'} ${isCorrectFormat ? 'PostgreSQL URL' : 'Wrong format'}`);
			console.log(`   Host: ${hasCorrectHost ? '✅' : '❌'} ${hasCorrectHost ? 'Correct Neon host' : 'Wrong host'}`);
			console.log(`   Database: ${hasCorrectDatabase ? '✅' : '❌'} ${hasCorrectDatabase ? 'Correct database name' : 'Wrong database'}`);
			console.log(`   SSL: ${hasSSL ? '✅' : '❌'} ${hasSSL ? 'SSL enabled' : 'SSL missing'}`);
			
			if (!isCorrectFormat || !hasCorrectHost || !hasCorrectDatabase || !hasSSL) {
				criticalIssues.push(`DATABASE_URL configuration issue detected`);
				allGood = false;
			}
			
			// Mask the URL for display
			const maskedUrl = value.replace(/:[^:]*@/, ':***@');
			console.log(`   Current: ${maskedUrl}`);
			
			if (!hasCorrectHost || !hasCorrectDatabase) {
				const maskedExpected = EXPECTED_NEON_URL.replace(/:[^:]*@/, ':***@');
				console.log(`   Expected: ${maskedExpected}`);
			}
		}
		
		if ((varName === 'JWT_SECRET' || varName === 'NEXTAUTH_SECRET') && value) {
			const isLongEnough = value.length >= (config.minLength || 32);
			console.log(`   Length: ${isLongEnough ? '✅' : '❌'} ${value.length} characters ${isLongEnough ? '(Good)' : '(Too short, needs 32+)'}`);
			
			if (!isLongEnough) {
				criticalIssues.push(`${varName} is too short (${value.length} chars, needs 32+)`);
				allGood = false;
			}
		}
		
		if (varName === 'NEXTAUTH_URL' && value) {
			const isHttps = value.startsWith('https://');
			const isVercelApp = value.includes('.vercel.app');
			console.log(`   Protocol: ${isHttps ? '✅' : '❌'} ${isHttps ? 'HTTPS' : 'Wrong protocol'}`);
			console.log(`   Domain: ${isVercelApp ? '✅' : '⚠️'} ${isVercelApp ? 'Vercel app' : 'Custom domain'}`);
			
			if (!isHttps) {
				warnings.push(`NEXTAUTH_URL should use HTTPS protocol`);
			}
		}
	}
	
	console.log('');
}

console.log('🎯 Summary:\n');

if (allGood && criticalIssues.length === 0) {
	console.log('✅ All critical environment variables are properly configured!');
	console.log('✅ Your Neon database configuration looks correct.');
	console.log('✅ Ready for production deployment.\n');
} else {
	console.log('❌ Issues found that need to be resolved:\n');
	
	if (criticalIssues.length > 0) {
		console.log('🚨 Critical Issues:');
		criticalIssues.forEach(issue => console.log(`   ❌ ${issue}`));
		console.log('');
	}
}

if (warnings.length > 0) {
	console.log('⚠️  Warnings:');
	warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
	console.log('');
}

console.log('📝 Next Steps:\n');

if (criticalIssues.length > 0) {
	console.log('1. 🔧 Fix Critical Issues:');
	console.log('   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
	console.log('   - Set the missing or incorrect environment variables');
	console.log('   - Use the exact values shown above');
	console.log('');
	
	console.log('2. 🚀 Redeploy:');
	console.log('   - Environment variable changes trigger automatic redeployment');
	console.log('   - Or manually redeploy from Vercel dashboard');
	console.log('');
	
	console.log('3. 🧪 Test:');
	console.log('   - Visit: https://your-app.vercel.app/api/database-diagnostic');
	console.log('   - Check: https://your-app.vercel.app/api/db-test');
	console.log('');
}

if (allGood) {
	console.log('1. 🧪 Test Your Database Connection:');
	console.log('   - Visit: https://your-app.vercel.app/api/database-diagnostic');
	console.log('   - Should show "healthy" status with data counts');
	console.log('');
	
	console.log('2. 🔐 Set Up Admin User (if needed):');
	console.log('   - Visit: https://your-app.vercel.app/setup');
	console.log('   - Use setup key: kylee-blog-setup-2024');
	console.log('');
	
	console.log('3. 🎛️ Access Admin Panel:');
	console.log('   - Visit: https://your-app.vercel.app/admin');
	console.log('   - View and manage your blog data');
	console.log('');
}

console.log('🔗 Useful Commands:');
console.log('   - Test locally: NODE_ENV=production node scripts/verify-vercel-env.js');
console.log('   - Generate secrets: openssl rand -hex 32');
console.log('   - Check Vercel logs: vercel logs');

process.exit(allGood ? 0 : 1);
