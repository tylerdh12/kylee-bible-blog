'use client';

import {
	Calendar,
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

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
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UIUser } from '@/types';

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
		url: '/admin/users',
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

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/admin';
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<Sidebar
			collapsible='icon'
			{...props}
		>
			<SidebarContent>
				{/* Quick Actions */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className='bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
								>
									<Link href='/admin/posts/new'>
										<PlusCircle className='size-4' />
										<span>New Post</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
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

			<SidebarFooter>
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
								<DropdownMenuItem onClick={handleLogout}>
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
