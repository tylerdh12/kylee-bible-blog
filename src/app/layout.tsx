import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalNavbar, ConditionalMainLayout } from '@/components/conditional-navbar';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
	title: "Kylee's Blog - Bible Study Journey",
	description:
		"Follow Kylee's Bible study journey, support her goals, and join her community.",
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
					<ConditionalNavbar />
					<ConditionalMainLayout>
						<ErrorBoundary>{children}</ErrorBoundary>
					</ConditionalMainLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
