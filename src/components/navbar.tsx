'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
	Menu,
	BookOpen,
	Heart,
	Home,
	User,
	Settings,
	X,
} from 'lucide-react';
import { ThemeToggle } from './theme-provider';
import { Button } from './ui/button';
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetTitle,
	SheetClose,
} from './ui/sheet';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface NavigationLink {
	href: string;
	label: string;
	icon: React.ElementType;
	description?: string;
}

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] =
		useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const pathname = usePathname();

	// Prevent hydration mismatch by only rendering Sheet on client
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const navigationLinks: NavigationLink[] = [
		{
			href: '/',
			label: 'Home',
			icon: Home,
			description: 'Welcome & latest updates',
		},
		{
			href: '/posts',
			label: 'Posts',
			icon: BookOpen,
			description: 'Bible study insights',
		},
		{
			href: '/about',
			label: 'About',
			icon: User,
			description: 'My faith journey',
		},
		{
			href: '/prayer-requests',
			label: 'Prayer Requests',
			icon: Heart,
			description: 'Submit prayer requests',
		},
	];

	// Handle scroll effect with throttling
	useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setIsScrolled(window.scrollY > 10);
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, {
			passive: true,
		});
		return () =>
			window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [pathname]);

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	return (
		<header
			className={cn(
				'fixed top-0 right-0 left-0 z-50 w-full transition-all duration-500 ease-out',
				isScrolled
					? 'border-b shadow-lg backdrop-blur-xl bg-background/95 border-border/50 shadow-black/5 dark:shadow-black/20'
					: 'border-b backdrop-blur-md bg-background border-border/30 sm:bg-background/80'
			)}
			role='banner'
			style={{
				WebkitBackdropFilter: 'blur(12px)',
				backdropFilter: 'blur(12px)',
			}}
		>
			<div className='px-4 w-full sm:px-6 lg:px-8 xl:px-12'>
				<div className='flex justify-between items-center h-16 md:h-18 lg:h-20'>
					{/* Logo/Brand - Enhanced */}
					<Link
						href='/'
						className='group flex items-center space-x-2.5 sm:space-x-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg'
						aria-label="Kylee's Blog - Home"
					>
						<div className='relative'>
							<div
								className={cn(
									'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12',
									'bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10',
									'rounded-xl sm:rounded-2xl',
									'flex justify-center items-center',
									'shadow-sm shadow-primary/10',
									'group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20',
									'group-hover:shadow-md group-hover:shadow-primary/20',
									'transition-all duration-300 ease-out',
									'border border-primary/10 group-hover:border-primary/20'
								)}
							>
								<BookOpen className='w-4 h-4 transition-transform duration-300 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary group-hover:scale-110' />
							</div>
						</div>
						<div className='flex items-center space-x-3'>
							<div className='hidden sm:block'>
								<h1 className='text-lg font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r sm:text-xl md:text-xl lg:text-2xl from-foreground via-foreground to-foreground/80'>
									Kylee&apos;s Blog
								</h1>
								<p className='text-[10px] sm:text-xs text-muted-foreground/80 font-medium leading-tight mt-0.5'>
									Bible Study Journey
								</p>
							</div>
							{/* Mobile Current Page Indicator */}
							<div className='flex items-center sm:hidden'>
								{(() => {
									const activeLink = navigationLinks.find(
										(link) => isActive(link.href)
									);
									if (activeLink) {
										const Icon = activeLink.icon;
										return (
											<div className='flex items-center space-x-2'>
												<Icon className='w-4 h-4 text-primary' />
												<span className='text-sm font-semibold text-foreground'>
													{activeLink.label}
												</span>
											</div>
										);
									}
									return null;
								})()}
							</div>
						</div>
					</Link>

					{/* Desktop Navigation - Enhanced */}
					<nav
						className='hidden lg:flex items-center space-x-1.5 xl:space-x-2'
						role='navigation'
						aria-label='Main navigation'
					>
						{navigationLinks.map((link, index) => {
							const Icon = link.icon;
							const active = isActive(link.href);

							return (
								<Link
									key={link.href}
									href={link.href}
									className={cn(
										'group relative flex items-center space-x-2 px-3.5 xl:px-4 py-2.5 rounded-xl',
										'font-medium text-sm transition-all duration-300 ease-out',
										'hover:scale-[1.02] active:scale-[0.98]',
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
										active
											? 'text-primary bg-primary/10 shadow-sm shadow-primary/5'
											: 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
									)}
									style={{
										animationDelay: `${index * 50}ms`,
									}}
								>
									<Icon
										className={cn(
											'w-4 h-4 transition-all duration-300',
											active
												? 'scale-110 text-primary'
												: 'text-muted-foreground/70 group-hover:text-foreground group-hover:scale-110'
										)}
									/>
									<span className='relative'>
										{link.label}
									</span>
								</Link>
							);
						})}
					</nav>

					{/* Right Side Actions - Enhanced */}
					<div className='flex items-center space-x-2 sm:space-x-3'>
						{/* Admin Button - Desktop */}
						<Link
							href='/admin'
							className='hidden lg:block'
							aria-label='Admin Dashboard'
						>
							<Button
								variant='outline'
								size='sm'
								className='relative group overflow-hidden h-9 px-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
							>
								<Settings className='mr-2 w-4 h-4 transition-transform duration-500 group-hover:rotate-90' />
								<span className='font-medium'>Admin</span>
								<div className='absolute inset-0 bg-gradient-to-r via-transparent to-transparent opacity-0 transition-opacity duration-500 from-primary/10 group-hover:opacity-100' />
							</Button>
						</Link>

						{/* Mobile Menu Button */}
						{isMounted ? (
							<Sheet
								open={isMobileMenuOpen}
								onOpenChange={setIsMobileMenuOpen}
							>
								<SheetTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										className='relative p-0 w-9 h-9 lg:hidden group'
										aria-label='Open navigation menu'
										aria-expanded={isMobileMenuOpen}
									>
										<Menu
											className={cn(
												'w-5 h-5 transition-all duration-300',
												isMobileMenuOpen &&
													'rotate-90 opacity-0'
											)}
										/>
										<X
											className={cn(
												'w-5 h-5 absolute transition-all duration-300',
												!isMobileMenuOpen &&
													'rotate-90 opacity-0',
												isMobileMenuOpen &&
													'rotate-0 opacity-100'
											)}
										/>
										<span className='sr-only'>
											Toggle navigation menu
										</span>
									</Button>
								</SheetTrigger>
								<SheetContent
									side='right'
									className='w-[85vw] max-w-sm sm:w-80 p-0 flex flex-col'
								>
								{/* Mobile Menu Header */}
								<SheetHeader className='px-6 pt-6 pb-4 border-b'>
									<SheetTitle className='flex items-center space-x-3 text-left'>
										<div className='flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-xl border shadow-sm from-primary/20 via-primary/15 to-primary/10 shadow-primary/10 border-primary/10'>
											<BookOpen className='w-5 h-5 text-primary' />
										</div>
										<div>
											<div className='text-base font-bold'>
												Kylee&apos;s Blog
											</div>
											<div className='text-xs text-muted-foreground font-normal mt-0.5'>
												Bible Study Journey
											</div>
										</div>
									</SheetTitle>
								</SheetHeader>

								{/* Mobile Navigation Links */}
								<nav
									className='overflow-y-auto flex-1 px-4 py-6 space-y-2'
									role='navigation'
									aria-label='Mobile navigation'
								>
									{navigationLinks.map((link, index) => {
										const Icon = link.icon;
										const active = isActive(link.href);

										return (
											<SheetClose
												asChild
												key={link.href}
											>
												<Link
													href={link.href}
													className={cn(
														'group relative flex items-start space-x-3 px-4 py-3.5 rounded-xl',
														'transition-all duration-300 ease-out',
														'hover:scale-[1.01] active:scale-[0.99]',
														'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
														active
															? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
															: 'hover:bg-accent text-muted-foreground hover:text-foreground border border-transparent'
													)}
													style={{
														animationDelay: `${
															index * 50
														}ms`,
													}}
												>
													<div
														className={cn(
															'flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg transition-all duration-300',
															active
																? 'bg-primary/15 text-primary'
																: 'bg-muted/50 text-muted-foreground group-hover:bg-accent group-hover:text-foreground'
														)}
													>
														<Icon
															className={cn(
																'w-5 h-5 transition-transform duration-300',
																active && 'scale-110'
															)}
														/>
													</div>
													<div className='flex-1 min-w-0 pt-0.5'>
														<div
															className={cn(
																'font-semibold text-sm mb-0.5',
																active
																	? 'text-primary'
																	: 'group-hover:text-foreground'
															)}
														>
															{link.label}
														</div>
														{link.description && (
															<div className='text-xs leading-relaxed text-muted-foreground/70'>
																{link.description}
															</div>
														)}
													</div>
												</Link>
											</SheetClose>
										);
									})}
								</nav>

								{/* Mobile Footer Section */}
								<div className='px-4 pt-4 pb-6 space-y-3 border-t'>
									{/* Theme Toggle */}
									<div className='flex items-center justify-between px-1 py-2'>
										<span className='text-sm font-medium text-muted-foreground'>
											Theme
										</span>
										<ThemeToggle />
									</div>

									<SheetClose asChild>
										<Link
											href='/admin'
											className='block'
										>
											<Button
												variant='outline'
												className='w-full justify-start h-11 group transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]'
											>
												<Settings className='mr-3 w-4 h-4 transition-transform duration-500 group-hover:rotate-90' />
												<span className='font-medium'>
													Admin Dashboard
												</span>
											</Button>
										</Link>
									</SheetClose>

									<div className='pt-2 text-center'>
										<p className='text-xs text-muted-foreground/70'>
											Built with{' '}
											<span className='text-primary'>
												❤️
											</span>{' '}
											for Bible study
										</p>
									</div>
								</div>
							</SheetContent>
						</Sheet>
						) : (
							// Render button without Sheet during SSR to prevent hydration mismatch
							<Button
								variant='outline'
								size='sm'
								className='relative p-0 w-9 h-9 lg:hidden group'
								aria-label='Open navigation menu'
								aria-expanded={false}
								disabled
							>
								<Menu className='w-5 h-5 transition-all duration-300' />
								<span className='sr-only'>
									Toggle navigation menu
								</span>
							</Button>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
