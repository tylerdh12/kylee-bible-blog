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
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				{/* Header */}
				<header className='flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
					<div className='flex w-full items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
						<Separator
							orientation='vertical'
							className='mr-2 h-4'
						/>

						{breadcrumbs.length > 0 && (
							<Breadcrumb>
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
							<h1 className='text-lg font-semibold'>
								{title}
							</h1>
						)}
					</div>
				</header>

				{/* Main Content */}
				<main className='flex flex-1 flex-col'>
					<div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
						{title && breadcrumbs.length > 0 && (
							<div className='space-y-0.5'>
								<h1 className='text-2xl font-bold tracking-tight'>
									{title}
								</h1>
								{description && (
									<div className='text-muted-foreground'>
										{typeof description === 'string' ? (
											<p>{description}</p>
										) : (
											description
										)}
									</div>
								)}
							</div>
						)}
						{children}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
