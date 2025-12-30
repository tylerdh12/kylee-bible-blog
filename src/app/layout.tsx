import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import MaintenanceCheck from '@/components/maintenance-check';

export const metadata: Metadata = {
	title: "Kylee's Blog - Bible Study Journey",
	description:
		"Follow Kylee's Bible study journey, support her goals, and join her community.",
	icons: {
		icon: [
			{ url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/favicon.ico', sizes: 'any' }, // Root-level for browser auto-discovery
			{ url: '/favicon/favicon.ico', sizes: 'any' },
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, // Root-level for browser auto-discovery
			{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
		],
		other: [
			{
				rel: 'manifest',
				url: '/favicon/site.webmanifest',
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
		>
			<body className='antialiased'>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<a
						href='#main-content'
						className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md'
					>
						Skip to main content
					</a>
					<MaintenanceCheck>{children}</MaintenanceCheck>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
