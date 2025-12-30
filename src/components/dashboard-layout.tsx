'use client';

import * as React from 'react';
import { AppSidebar } from './app-sidebar';
import {
	SidebarInset,
	SidebarProvider,
} from './ui/sidebar';
import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from './ui/breadcrumb';
import { ThemeToggle } from './theme-provider';
import { UIUser } from '@/types';

interface DashboardLayoutProps {
	children: React.ReactNode;
	user?: UIUser;
	breadcrumbs?: Array<{
		label: string;
		href?: string;
	}>;
	title?: string;
	description?: string | React.ReactNode;
}

export function DashboardLayout({
	children,
	user,
	breadcrumbs = [],
	title,
	description,
}: DashboardLayoutProps) {
	return (
		<SidebarProvider defaultOpen={true}>
			<AppSidebar user={user} />
			<SidebarInset>
				{/* Dashboard Header with breadcrumbs and controls */}
				<header className='flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
					<div className='flex flex-1 gap-2 items-center px-4 min-w-0'>
						<SidebarTrigger className='flex-shrink-0 -ml-1' />
						<Separator
							orientation='vertical'
							className='flex-shrink-0 mr-2 h-4'
						/>

						{breadcrumbs.length > 0 && (
							<Breadcrumb className='flex-1 min-w-0'>
								<BreadcrumbList>
									{breadcrumbs.map((crumb, index) => (
										<React.Fragment
											key={`breadcrumb-${index}-${crumb.label}`}
										>
											<BreadcrumbItem className='hidden md:block'>
												{crumb.href ? (
													<BreadcrumbLink href={crumb.href}>
														{crumb.label}
													</BreadcrumbLink>
												) : (
													<BreadcrumbPage>
														{crumb.label}
													</BreadcrumbPage>
												)}
											</BreadcrumbItem>
											{index < breadcrumbs.length - 1 && (
												<BreadcrumbSeparator className='hidden md:block' />
											)}
										</React.Fragment>
									))}
								</BreadcrumbList>
							</Breadcrumb>
						)}

						{title && !breadcrumbs.length && (
							<h1 className='flex-1 min-w-0 text-lg font-semibold truncate'>
								{title}
							</h1>
						)}
					</div>

					{/* Right side controls */}
					<div className='flex flex-shrink-0 gap-2 items-center px-4'>
						<ThemeToggle />
					</div>
				</header>

				{/* Main Content */}
				<main className='flex flex-col flex-1'>
					<div className='flex-1 p-4 pt-6 space-y-4 md:p-8'>
						{children}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
