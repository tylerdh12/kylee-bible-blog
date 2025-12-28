'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen, Heart, MessageCircle, Home, User, Settings, X, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './theme-provider';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
	const pathname = usePathname();

	const navigationLinks: NavigationLink[] = [
		{
			href: '/',
			label: 'Home',
			icon: Home,
			description: 'Welcome & latest updates'
		},
		{
			href: '/posts',
			label: 'Posts',
			icon: BookOpen,
			description: 'Bible study insights'
		},
		{
			href: '/about',
			label: 'About',
			icon: User,
			description: 'My faith journey'
		},
		{
			href: '/prayer-requests',
			label: 'Prayer',
			icon: Heart,
			description: 'Submit prayer requests'
		},
	];

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	return (
		<header className={cn(
			'sticky top-0 z-50 w-full transition-all duration-300 ease-in-out',
			isScrolled
				? 'bg-background/95 backdrop-blur-md border-b shadow-sm'
				: 'bg-background/80 backdrop-blur-sm border-b border-border/40'
		)}>
			<div className='container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16 lg:h-20'>
					{/* Logo/Brand */}
					<Link
						href='/'
						className='group flex items-center space-x-3 transition-all duration-200 hover:scale-105'
					>
						<div className='relative'>
							<div className='w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-200'>
								<BookOpen className='w-5 h-5 text-primary' />
							</div>
							<div className='absolute -top-1 -right-1 w-3 h-3 bg-primary/20 rounded-full animate-pulse' />
						</div>
						<div className='hidden sm:block'>
							<h1 className='text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
								Kylee&apos;s Blog
							</h1>
							<p className='text-xs text-muted-foreground/80 font-medium'>
								Bible Study Journey
							</p>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden lg:flex items-center space-x-1' role='navigation' aria-label='Main navigation'>
						{navigationLinks.map((link) => {
							const Icon = link.icon;
							const active = isActive(link.href);

							return (
								<Link
									key={link.href}
									href={link.href}
									className={cn(
										'group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-accent/50',
										active
											? 'text-primary bg-primary/10 shadow-sm'
											: 'text-muted-foreground hover:text-foreground'
									)}
								>
									<Icon className={cn(
										'w-4 h-4 transition-colors duration-200',
										active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
									)} />
									<span>{link.label}</span>
									{active && (
										<div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full' />
									)}
								</Link>
							);
						})}
					</nav>

					{/* Right Side Actions */}
					<div className='flex items-center space-x-3'>
						<ThemeToggle />

						{/* Admin Button - Desktop */}
						<Link href='/admin' className='hidden lg:block'>
							<Button variant='outline' size='sm' className='relative group overflow-hidden'>
								<Settings className='w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300' />
								<span>Admin</span>
								<div className='absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
							</Button>
						</Link>

						{/* Mobile Menu */}
						<Sheet>
							<SheetTrigger asChild className='lg:hidden'>
								<Button variant='outline' size='sm' className='p-2'>
									<Menu className='w-5 h-5' />
									<span className='sr-only'>Open navigation menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side='right' className='w-72'>
								<SheetHeader className='text-left'>
									<SheetTitle className='flex items-center space-x-3'>
										<div className='w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center'>
											<BookOpen className='w-4 h-4 text-primary' />
										</div>
										<div>
											<div className='font-bold'>Kylee&apos;s Blog</div>
											<div className='text-xs text-muted-foreground font-normal'>Bible Study Journey</div>
										</div>
									</SheetTitle>
								</SheetHeader>

								<div className='mt-8 space-y-1'>
									{navigationLinks.map((link) => {
										const Icon = link.icon;
										const active = isActive(link.href);

										return (
											<Link
												key={link.href}
												href={link.href}
												className={cn(
													'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group',
													active
														? 'bg-primary/10 text-primary border border-primary/20'
														: 'hover:bg-accent text-muted-foreground hover:text-foreground'
												)}
											>
												<Icon className={cn(
													'w-5 h-5 transition-colors duration-200',
													active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
												)} />
												<div className='flex-1'>
													<div className={cn(
														'font-medium text-sm',
														active ? 'text-primary' : 'group-hover:text-foreground'
													)}>
														{link.label}
													</div>
													{link.description && (
														<div className='text-xs text-muted-foreground/70 mt-0.5'>
															{link.description}
														</div>
													)}
												</div>
												{active && <Badge variant='secondary' className='text-xs px-2 py-0.5'>Current</Badge>}
											</Link>
										);
									})}
								</div>

								{/* Mobile Admin Section */}
								<div className='mt-8 pt-6 border-t space-y-4'>
									<Link href='/admin' className='block'>
										<Button variant='outline' className='w-full justify-start group'>
											<Settings className='w-4 h-4 mr-3 transition-transform group-hover:rotate-90 duration-300' />
											Admin Dashboard
										</Button>
									</Link>

									<div className='text-center pt-4'>
										<p className='text-xs text-muted-foreground'>
											Built with ❤️ for Bible study
										</p>
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	);
}
