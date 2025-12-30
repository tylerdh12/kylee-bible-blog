import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Note: FlatCompat may show warnings about deprecated options (useEslintrc, extensions)
// when converting Next.js ESLint configs. These warnings are harmless and don't affect
// the build. This is a known issue with the compatibility layer between ESLint 8/9
// and Next.js configs. The warning is emitted by ESLint itself during execution,
// not during config loading, so it cannot be suppressed here.
const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		ignores: [
			'node_modules/**',
			'.next/**',
			'.vercel/**',
			'out/**',
			'build/**',
			'dist/**',
			'coverage/**',
			'next-env.d.ts',
			'*.tsbuildinfo',
			'*.log',
			'.DS_Store',
			'*.local',
			'*.env',
		],
	},
	...compat.extends(
		'next/core-web-vitals',
		'next/typescript'
	),
	{
		rules: {
			'react/no-unescaped-entities': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
	{
		files: ['scripts/**/*.js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
	{
		files: ['tailwind.config.js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
];

export default eslintConfig;
