'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-provider';
import { Button } from './ui/button';

export function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navigationLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/posts', label: 'Posts' },
		{ href: '/about', label: 'About' },
		{ href: '/goals', label: 'Goals' },
		{ href: '/donate', label: 'Donate' },
		{ href: '/prayer-requests', label: 'Prayer Requests' },
	];

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	return (
		<nav
			className='border-b'
			role='navigation'
			aria-label='Main navigation'
		>
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					<div className='flex items-center space-x-4'>
						<Link
							href='/'
							className='text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md'
							onClick={closeMenu}
						>
							Kylee&apos;s Blog
						</Link>

						{/* Desktop Navigation */}
						<div
							className='hidden md:flex space-x-4'
							role='menubar'
						>
							{navigationLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1'
									role='menuitem'
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>

					<div className='flex items-center space-x-4'>
						<ThemeToggle />
						<Link
							href='/admin'
							className='hidden md:block'
						>
							<Button
								variant='outline'
								size='sm'
							>
								Admin
							</Button>
						</Link>

						{/* Mobile menu button */}
						<button
							onClick={toggleMenu}
							className='md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
							aria-label={
								isMenuOpen ? 'Close menu' : 'Open menu'
							}
							aria-expanded={isMenuOpen}
							aria-controls='mobile-menu'
						>
							{isMenuOpen ? (
								<X
									className='h-6 w-6'
									aria-hidden='true'
								/>
							) : (
								<Menu
									className='h-6 w-6'
									aria-hidden='true'
								/>
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				<div
					id='mobile-menu'
					className={`md:hidden transition-all duration-300 ease-in-out ${
						isMenuOpen
							? 'max-h-80 opacity-100 border-t'
							: 'max-h-0 opacity-0 overflow-hidden'
					}`}
					aria-hidden={!isMenuOpen}
					role='menu'
					aria-orientation='vertical'
					aria-labelledby='mobile-menu-button'
				>
					<div className='py-4 space-y-1'>
						{navigationLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={closeMenu}
								className='block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md mx-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
								role='menuitem'
								tabIndex={isMenuOpen ? 0 : -1}
							>
								{link.label}
							</Link>
						))}

						{/* Mobile Admin Button */}
						<div
							className='px-6 py-2'
							role='none'
						>
							<Link
								href='/admin'
								onClick={closeMenu}
								tabIndex={isMenuOpen ? 0 : -1}
							>
								<Button
									variant='outline'
									size='sm'
									className='w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
								>
									Admin
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
