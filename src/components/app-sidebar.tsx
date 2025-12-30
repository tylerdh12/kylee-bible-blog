'use client';

import {
	BookOpen,
	Calendar,
	ExternalLink,
	FileText,
	Heart,
	HeartHandshake,
	Home,
	LogOut,
	MessageCircle,
	PlusCircle,
	Settings,
	Target,
	Users,
	Globe,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useCallback } from 'react';
import { authClient } from '@/lib/better-auth-client';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UIUser } from '@/types';

const mainSiteItems = [
	{
		title: 'View Site',
		url: '/',
		icon: Home,
	},
	{
		title: 'Posts',
		url: '/posts',
		icon: BookOpen,
	},
	{
		title: 'About',
		url: '/about',
		icon: Users,
	},
	{
		title: 'Prayer',
		url: '/prayer-requests',
		icon: HeartHandshake,
	},
];

const navigationItems = [
	{
		title: 'Dashboard',
		url: '/admin',
		icon: Home,
	},
];

const contentItems = [
	{
		title: 'Posts',
		url: '/admin/posts',
		icon: FileText,
	},
	{
		title: 'Goals',
		url: '/admin/goals',
		icon: Target,
	},
	{
		title: 'Donations',
		url: '/admin/donations',
		icon: Heart,
	},
	{
		title: 'Site Content',
		url: '/admin/site-content',
		icon: Globe,
	},
];

const engagementItems = [
	{
		title: 'Prayer Requests',
		url: '/admin/prayer-requests',
		icon: HeartHandshake,
	},
	{
		title: 'Comments',
		url: '/admin/comments',
		icon: MessageCircle,
	},
	{
		title: 'Subscribers',
		url: '/admin/subscribers',
		icon: Users,
	},
	{
		title: 'Schedule',
		url: '/admin/schedule',
		icon: Calendar,
	},
];

const adminItems = [
	{
		title: 'Users',
		url: '/admin/users-enhanced',
		icon: Users,
	},
	{
		title: 'Settings',
		url: '/admin/settings',
		icon: Settings,
	},
];

interface AppSidebarProps
	extends React.ComponentProps<typeof Sidebar> {
	user?: UIUser;
}

export function AppSidebar({
	user,
	...props
}: AppSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = useCallback(async () => {
		// Use better-auth's signOut method with fetchOptions for redirect
		// This is the recommended way according to better-auth documentation
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					// Clear any local state
					window.dispatchEvent(
						new CustomEvent('auth-changed', {
							detail: { authenticated: false, user: null },
						})
					);
					// Redirect to login page after successful logout
					router.push('/admin');
				},
				onError: (error: any) => {
					// Even if there's an error, clear local state and redirect
					console.error('[Logout] Logout error:', error);
					window.dispatchEvent(
						new CustomEvent('auth-changed', {
							detail: { authenticated: false, user: null },
						})
					);
					// Use window.location as fallback if router fails
					window.location.replace('/admin');
				},
			},
		});
	}, [router]);

	return (
		<Sidebar
			collapsible='icon'
			{...props}
		>
			{/* Integrated Header */}
			<SidebarHeader className='justify-center items-start h-16 border-b'>
				<div className='flex items-center justify-between pl-2 group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:justify-center'>
					<Link
						href='/'
						className='flex items-center space-x-3 min-w-0 group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:justify-center transition-all duration-200 w-full group-data-[collapsible=icon]:w-auto'
					>
						<div className='flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gradient-to-br rounded-lg border shadow-sm transition-all duration-200 from-primary/20 via-primary/15 to-primary/10 shadow-primary/10 border-primary/10 hover:shadow-md hover:shadow-primary/20'>
							<BookOpen className='w-4 h-4 transition-transform duration-200 text-primary hover:scale-110' />
						</div>
						<div className='group-data-[collapsible=icon]:hidden min-w-0 flex-1 overflow-hidden'>
							<h1 className='text-sm font-bold leading-tight text-transparent truncate bg-clip-text bg-gradient-to-r from-foreground via-foreground to-foreground/80'>
								Kylee&apos;s Blog
							</h1>
							<p className='text-[10px] text-muted-foreground/80 font-medium leading-tight mt-0.5 truncate'>
								Bible Study Journey
							</p>
						</div>
					</Link>
				</div>
			</SidebarHeader>

			<SidebarContent>
				{/* Quick Actions */}
				<SidebarGroup>
					<SidebarGroupLabel>
						Admin Dashboard
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={pathname === '/admin/posts/new'}
									className='bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground hover:shadow-lg hover:scale-[1.02] dark:hover:bg-sidebar-primary/85 dark:hover:text-sidebar-primary-foreground dark:hover:shadow-xl transition-all duration-200'
								>
									<Link href='/admin/posts/new'>
										<PlusCircle className='size-4' />
										<span>New Post</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.icon className='size-4' />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Main Site Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>
						Site Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainSiteItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={`${item.title} (Public Site)`}
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.icon className='size-4' />
											<span>{item.title}</span>
											<ExternalLink className='ml-auto opacity-60 size-3' />
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Content Management */}
				<SidebarGroup>
					<SidebarGroupLabel>Content</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{contentItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname?.startsWith(
											item.url
										)}
									>
										<Link href={item.url}>
											<item.icon className='size-4' />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Engagement */}
				<SidebarGroup>
					<SidebarGroupLabel>Engagement</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{engagementItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname?.startsWith(
											item.url
										)}
									>
										<Link href={item.url}>
											<item.icon className='size-4' />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Admin */}
				<SidebarGroup>
					<SidebarGroupLabel>
						Administration
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{adminItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.icon className='size-4' />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className='border-t'>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size='lg'
									className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground data-[collapsible=icon]:justify-center'
								>
									<Avatar className='w-8 h-8 rounded-lg'>
										<AvatarImage
											src={user?.avatar}
											alt={user?.name || undefined}
										/>
										<AvatarFallback className='rounded-lg'>
											{user?.name?.charAt(0) || 'K'}
										</AvatarFallback>
									</Avatar>
									<div className='grid flex-1 text-sm leading-tight text-left group-data-[collapsible=icon]:hidden'>
										<span className='font-semibold truncate'>
											{user?.name || 'Kylee'}
										</span>
										<span className='text-xs truncate'>
											{user?.email || 'admin'}
										</span>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
								side='right'
								align='end'
								sideOffset={4}
							>
								<DropdownMenuItem asChild>
									<Link href='/admin/profile'>
										<Users className='size-4' />
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href='/admin/settings'>
										<Settings className='size-4' />
										Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleLogout()}
								>
									<LogOut className='size-4' />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
