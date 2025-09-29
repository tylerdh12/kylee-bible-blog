'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	BookOpen,
	Calendar,
	FileText,
	Heart,
	Home,
	LogOut,
	MessageCircle,
	PlusCircle,
	Settings,
	Target,
	Users,
	HeartHandshake,
} from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar';
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
		items: [{ title: 'New Post', url: '/admin/posts/new' }],
	},
	{
		title: 'Goals',
		url: '/admin/goals',
		icon: Target,
		items: [
			{ title: 'All Goals', url: '/admin/goals' },
			{ title: 'New Goal', url: '/admin/goals/new' },
		],
	},
	{
		title: 'Donations',
		url: '/admin/donations',
		icon: Heart,
		items: [
			{ title: 'All Donations', url: '/admin/donations' },
		],
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
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size='lg'
							asChild
						>
							<Link
								href='/admin'
								className='flex items-center gap-2'
							>
								<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
									<BookOpen className='size-4' />
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-semibold'>
										Kylee's Blog
									</span>
									<span className='truncate text-xs'>
										Admin Dashboard
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{/* Quick Actions */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className='bg-primary text-primary-foreground hover:bg-primary/90'
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

				{/* Settings (hidden until implemented) */}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size='lg'
									className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
								>
									<Avatar className='h-8 w-8 rounded-lg'>
										<AvatarImage
											src={user?.avatar}
											alt={user?.name || undefined}
										/>
										<AvatarFallback className='rounded-lg'>
											{user?.name?.charAt(0) || 'K'}
										</AvatarFallback>
									</Avatar>
									<div className='grid flex-1 text-left text-sm leading-tight'>
										<span className='truncate font-semibold'>
											{user?.name || 'Kylee'}
										</span>
										<span className='truncate text-xs'>
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
