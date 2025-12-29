'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { cn } from '@/lib/utils';

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export function ConditionalNavbar() {
	const pathname = usePathname();

	// Don't show navbar on admin pages
	if (pathname?.startsWith('/admin')) {
		return null;
	}

	return <Navbar />;
}

export function ConditionalMainLayout({ children }: ConditionalLayoutProps) {
	const pathname = usePathname();
	const isAdminPage = pathname?.startsWith('/admin');

	return (
		<main
			id='main-content'
			className={cn(
				'min-h-screen bg-background',
				isAdminPage
					? 'pt-0'
					: 'pt-16 md:pt-[4.5rem] lg:pt-20'
			)}
		>
			{children}
		</main>
	);
}