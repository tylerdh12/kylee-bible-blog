import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

// Dashboard Stats Skeleton - matches DashboardStatsClient structure
export function DashboardStatsSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{Array.from({ length: 8 }).map((_, i) => (
				<Card key={`stat-${i}`}>
					<CardContent className='p-6'>
						<div className='flex items-center'>
							<Skeleton className='h-4 w-4 rounded' />
							<div className='ml-2 flex-1'>
								<Skeleton className='h-3 w-24 mb-2' />
								<Skeleton className='h-8 w-16' />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Users Table Skeleton
export function UsersTableSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='space-y-2'>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='h-4 w-64' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-24' />
					<Skeleton className='h-10 w-32' />
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid gap-4 md:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={`user-stat-${i}`}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-4 rounded' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-8 w-16 mb-2' />
							<Skeleton className='h-3 w-32' />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Filters and Search */}
			<div className='flex flex-col sm:flex-row gap-4'>
				<Skeleton className='h-10 flex-1' />
				<Skeleton className='h-10 w-32' />
				<Skeleton className='h-10 w-32' />
			</div>

			{/* Table */}
			<Card>
				<CardContent className='p-0'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b'>
									<th className='p-4 text-left'>
										<Skeleton className='h-4 w-6' />
									</th>
									<th className='p-4 text-left'>
										<Skeleton className='h-4 w-20' />
									</th>
									<th className='p-4 text-left'>
										<Skeleton className='h-4 w-32' />
									</th>
									<th className='p-4 text-left'>
										<Skeleton className='h-4 w-24' />
									</th>
									<th className='p-4 text-left'>
										<Skeleton className='h-4 w-20' />
									</th>
									<th className='p-4 text-right'>
										<Skeleton className='h-4 w-16 ml-auto' />
									</th>
								</tr>
							</thead>
							<tbody>
								{Array.from({ length: 5 }).map((_, i) => (
									<tr key={`row-${i}`} className='border-b'>
										<td className='p-4'>
											<Skeleton className='h-4 w-4' />
										</td>
										<td className='p-4'>
											<div className='flex items-center gap-3'>
												<Skeleton className='h-10 w-10 rounded-full' />
												<div className='space-y-1'>
													<Skeleton className='h-4 w-32' />
													<Skeleton className='h-3 w-40' />
												</div>
											</div>
										</td>
										<td className='p-4'>
											<Skeleton className='h-4 w-48' />
										</td>
										<td className='p-4'>
											<Skeleton className='h-6 w-20 rounded-full' />
										</td>
										<td className='p-4'>
											<Skeleton className='h-6 w-16 rounded-full' />
										</td>
										<td className='p-4 text-right'>
											<Skeleton className='h-8 w-8 rounded ml-auto' />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Posts List Skeleton - matches PostsListClient structure
export function PostsListSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center mb-6'>
				<div>
					<Skeleton className='h-9 w-32 mb-2' />
					<Skeleton className='h-4 w-80' />
				</div>
				<Skeleton className='h-10 w-28' />
			</div>

			{/* Filter Card */}
			<Card>
				<CardHeader>
					<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
						<Skeleton className='h-6 w-32' />
						<div className='hidden sm:flex gap-2'>
							<Skeleton className='h-8 w-32' />
							<Skeleton className='h-8 w-36' />
							<Skeleton className='h-8 w-28' />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Search and Filter Row */}
					<div className='flex flex-col sm:flex-row gap-4 mb-6'>
						<div className='flex-1 relative'>
							<Skeleton className='h-10 w-full rounded-md' />
						</div>
						<Skeleton className='h-10 w-full sm:w-[180px] rounded-md' />
					</div>

					{/* Posts List */}
					<div className='space-y-4'>
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={`post-${i}`}
								className='border rounded-lg p-4'
							>
								<div className='flex items-start gap-4'>
									{/* Checkbox */}
									<Skeleton className='h-4 w-4 rounded mt-1' />
									<div className='flex-1'>
										{/* Title and Badge Row */}
										<div className='flex justify-between items-start mb-3'>
											<div className='flex-1'>
												<Skeleton className='h-6 w-3/4 mb-2' />
												<Skeleton className='h-4 w-full mb-2' />
												<div className='flex items-center gap-4'>
													<Skeleton className='h-3 w-32' />
													<Skeleton className='h-3 w-24' />
												</div>
											</div>
											<Skeleton className='h-6 w-20 rounded-full ml-4' />
										</div>

										{/* Tags */}
										<div className='flex flex-wrap gap-1 mb-3'>
											<Skeleton className='h-5 w-16 rounded-full' />
											<Skeleton className='h-5 w-20 rounded-full' />
											<Skeleton className='h-5 w-14 rounded-full' />
										</div>

										{/* Action Buttons */}
										<div className='flex items-center gap-2'>
											<Skeleton className='h-8 w-20 rounded-md' />
											<Skeleton className='h-8 w-20 rounded-md' />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					<div className='flex items-center justify-between mt-6 pt-4 border-t'>
						<Skeleton className='h-4 w-48' />
						<div className='flex gap-2'>
							<Skeleton className='h-8 w-20 rounded-md' />
							<div className='flex gap-1'>
								<Skeleton className='h-8 w-8 rounded-md' />
								<Skeleton className='h-8 w-8 rounded-md' />
								<Skeleton className='h-8 w-8 rounded-md' />
							</div>
							<Skeleton className='h-8 w-16 rounded-md' />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Settings Form Skeleton - matches SettingsPage structure
export function SettingsFormSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-32 mb-2' />
					<Skeleton className='h-4 w-80' />
				</div>
				<Skeleton className='h-10 w-36 rounded-md' />
			</div>

			{/* Form Sections Grid */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* General Settings Card */}
				<Card>
					<CardHeader>
						<div className='flex items-center gap-2 mb-2'>
							<Skeleton className='h-5 w-5 rounded' />
							<Skeleton className='h-6 w-40' />
						</div>
						<Skeleton className='h-4 w-48' />
					</CardHeader>
					<CardContent className='space-y-4'>
						{Array.from({ length: 3 }).map((_, j) => (
							<div key={`field-${j}`} className='space-y-2'>
								<Skeleton className='h-4 w-28' />
								<Skeleton className='h-10 w-full rounded-md' />
							</div>
						))}
					</CardContent>
				</Card>

				{/* Admin Settings Card */}
				<Card>
					<CardHeader>
						<div className='flex items-center gap-2 mb-2'>
							<Skeleton className='h-5 w-5 rounded' />
							<Skeleton className='h-6 w-36' />
						</div>
						<Skeleton className='h-4 w-40' />
					</CardHeader>
					<CardContent className='space-y-4'>
						{Array.from({ length: 2 }).map((_, j) => (
							<div key={`field-${j}`} className='space-y-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-10 w-full rounded-md' />
							</div>
						))}
					</CardContent>
				</Card>

				{/* Feature Toggles Card */}
				<Card>
					<CardHeader>
						<div className='flex items-center gap-2 mb-2'>
							<Skeleton className='h-5 w-5 rounded' />
							<Skeleton className='h-6 w-44' />
						</div>
						<Skeleton className='h-4 w-52' />
					</CardHeader>
					<CardContent className='space-y-4'>
						{Array.from({ length: 3 }).map((_, j) => (
							<div key={`toggle-${j}`} className='flex items-center justify-between'>
								<div className='space-y-1'>
									<Skeleton className='h-4 w-32' />
									<Skeleton className='h-3 w-48' />
								</div>
								<Skeleton className='h-6 w-11 rounded-full' />
							</div>
						))}
					</CardContent>
				</Card>

				{/* System Settings Card */}
				<Card>
					<CardHeader>
						<div className='flex items-center gap-2 mb-2'>
							<Skeleton className='h-5 w-5 rounded' />
							<Skeleton className='h-6 w-40' />
						</div>
						<Skeleton className='h-4 w-44' />
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='space-y-1'>
								<Skeleton className='h-4 w-36' />
								<Skeleton className='h-3 w-56' />
							</div>
							<Skeleton className='h-6 w-11 rounded-full' />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// Profile Form Skeleton - matches ProfileClient structure
export function ProfileFormSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<Skeleton className='h-9 w-32 mb-2' />
					<Skeleton className='h-5 w-80' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-36 rounded-md' />
					<Skeleton className='h-10 w-32 rounded-md' />
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Profile Overview Card */}
				<Card className='h-full'>
					<CardHeader className='text-center pb-4'>
						<div className='mb-4'>
							<Skeleton className='h-28 w-28 rounded-full mx-auto' />
						</div>
						<Skeleton className='h-6 w-40 mx-auto mb-2' />
						<Skeleton className='h-5 w-56 mx-auto mb-3' />
						<Skeleton className='h-6 w-20 mx-auto rounded-full' />
					</CardHeader>
					<CardContent className='pt-6'>
						<div className='space-y-4'>
							{/* Posts Stat */}
							<div className='p-4 rounded-lg bg-muted/50'>
								<div className='flex items-center gap-3'>
									<Skeleton className='h-10 w-10 rounded-md' />
									<div className='flex-1 space-y-2'>
										<Skeleton className='h-4 w-24' />
										<Skeleton className='h-8 w-12' />
									</div>
								</div>
							</div>
							<Separator />
							{/* Comments Stat */}
							<div className='p-4 rounded-lg bg-muted/50'>
								<div className='flex items-center gap-3'>
									<Skeleton className='h-10 w-10 rounded-md' />
									<div className='flex-1 space-y-2'>
										<Skeleton className='h-4 w-28' />
										<Skeleton className='h-8 w-12' />
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Profile Details */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Profile Information Card */}
					<Card>
						<CardHeader>
							<Skeleton className='h-6 w-48 mb-2' />
							<Skeleton className='h-4 w-64' />
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Name and Email Row */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-10 w-full rounded-lg' />
								</div>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-32' />
									<Skeleton className='h-10 w-full rounded-lg' />
								</div>
							</div>
							<Separator />
							{/* Bio Section */}
							<div className='space-y-2'>
								<Skeleton className='h-4 w-16' />
								<Skeleton className='h-24 w-full rounded-lg' />
							</div>
							<Separator />
							{/* Website Section */}
							<div className='space-y-2'>
								<Skeleton className='h-4 w-20' />
								<Skeleton className='h-10 w-full rounded-lg' />
							</div>
						</CardContent>
					</Card>

					{/* Account Information Card */}
					<Card>
						<CardHeader>
							<Skeleton className='h-6 w-48 mb-2' />
							<Skeleton className='h-4 w-56' />
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-28' />
									<Skeleton className='h-12 w-full rounded-lg' />
								</div>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-28' />
									<Skeleton className='h-12 w-full rounded-lg' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// Comments List Skeleton - matches CommentsListClient structure exactly
export function CommentsListSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-40 mb-2' />
					<Skeleton className='h-4 w-64' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-6 w-20 rounded-full' />
					<Skeleton className='h-6 w-24 rounded-full' />
				</div>
			</div>

			{/* Filters Card */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='flex-1 relative'>
							<Skeleton className='h-10 w-full rounded-md' />
						</div>
						<Skeleton className='h-10 w-full sm:w-48 rounded-md' />
					</div>
				</CardContent>
			</Card>

			{/* Comments List */}
			<div className='space-y-4'>
				{Array.from({ length: 5 }).map((_, i) => (
					<Card key={`comment-${i}`}>
						<CardContent className='p-6'>
							<div className='flex gap-4'>
								{/* Avatar */}
								<Skeleton className='h-10 w-10 rounded-full flex-shrink-0' />
								<div className='flex-1 space-y-3'>
									{/* Header Row with Actions */}
									<div className='flex items-start justify-between gap-4'>
										<div className='flex items-start gap-3 flex-1'>
											<div className='flex-1 space-y-1'>
												{/* Author Name and Badges Row */}
												<div className='flex items-center gap-2 flex-wrap'>
													<Skeleton className='h-4 w-24' />
													<Skeleton className='h-5 w-16 rounded-full' />
													<Skeleton className='h-5 w-20 rounded-full' />
												</div>
												{/* Email */}
												<Skeleton className='h-3 w-40' />
												{/* Date and Post Link */}
												<div className='flex items-center gap-1 text-xs'>
													<Skeleton className='h-3 w-32' />
													<Skeleton className='h-3 w-24' />
												</div>
											</div>
										</div>
										{/* Action Buttons */}
										<div className='flex items-center gap-2'>
											<Skeleton className='h-8 w-24 rounded-md' />
											<Skeleton className='h-8 w-8 rounded-md' />
										</div>
									</div>
									{/* Comment Content */}
									<div className='space-y-2'>
										<Skeleton className='h-4 w-full' />
										<Skeleton className='h-4 w-5/6' />
										<Skeleton className='h-4 w-4/6' />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			<div className='flex justify-center gap-2'>
				<Skeleton className='h-9 w-20 rounded-md' />
				<div className='flex items-center gap-2'>
					<Skeleton className='h-4 w-24' />
				</div>
				<Skeleton className='h-9 w-16 rounded-md' />
			</div>
		</div>
	);
}

// Prayer Requests List Skeleton - matches PrayerRequestsListClient structure
export function PrayerRequestsListSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<div>
					<Skeleton className='h-9 w-48 mb-2' />
					<Skeleton className='h-4 w-48' />
				</div>
			</div>

			{/* Prayer Requests Grid */}
			<div className='grid gap-4 md:grid-cols-2'>
				{Array.from({ length: 6 }).map((_, i) => (
					<Card key={`request-${i}`}>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<Skeleton className='h-6 w-32' />
								<div className='flex gap-2'>
									<Skeleton className='h-6 w-16 rounded-full' />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{/* Email */}
								<Skeleton className='h-3 w-40' />
								{/* Message */}
								<div className='space-y-2'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-5/6' />
									<Skeleton className='h-4 w-4/6' />
								</div>
								{/* Footer with Date and Actions */}
								<div className='flex justify-between items-center'>
									<Skeleton className='h-3 w-32' />
									<div className='flex gap-2'>
										<Skeleton className='h-8 w-28 rounded-md' />
										<Skeleton className='h-8 w-8 rounded-md' />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// Goals List Skeleton - matches GoalsListClient structure
export function GoalsListSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center mb-6'>
				<div className='flex items-center gap-2'>
					<Skeleton className='h-4 w-32' />
				</div>
				<Skeleton className='h-10 w-28' />
			</div>

			{/* Goals List */}
			<div className='space-y-6'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={`goal-${i}`}>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div className='flex-1'>
									<div className='flex items-center gap-2 mb-2'>
										<Skeleton className='h-6 w-48' />
										<Skeleton className='h-5 w-20 rounded-full' />
									</div>
									<Skeleton className='h-4 w-3/4' />
								</div>
								<div className='text-right'>
									<Skeleton className='h-8 w-32 mb-1' />
									<Skeleton className='h-4 w-24' />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{/* Progress Bar */}
								<div className='w-full bg-gray-200 rounded-full h-2'>
									<Skeleton className='h-2 w-3/4 rounded-full' />
								</div>

								{/* Footer Info */}
								<div className='flex justify-between items-center text-sm'>
									<div className='flex gap-4'>
										<Skeleton className='h-3 w-32' />
										<Skeleton className='h-3 w-28' />
									</div>
									<div className='flex items-center gap-4'>
										<Skeleton className='h-3 w-24' />
										<Skeleton className='h-8 w-20 rounded-md' />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// Site Content Form Skeleton - matches SiteContentPage structure with tabs
export function SiteContentFormSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-9 w-48 mb-2' />
					<Skeleton className='h-4 w-64' />
				</div>
				<Skeleton className='h-10 w-32 rounded-md' />
			</div>

			{/* Tabs */}
			<div className='flex gap-2 border-b'>
				{Array.from({ length: 2 }).map((_, i) => (
					<Skeleton key={`tab-${i}`} className='h-10 w-32 mb-[-1px] rounded-t-md' />
				))}
			</div>

			{/* Form Cards */}
			<div className='space-y-6'>
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={`section-${i}`}>
						<CardHeader>
							<Skeleton className='h-6 w-40 mb-2' />
							<Skeleton className='h-4 w-64' />
						</CardHeader>
						<CardContent className='space-y-4'>
							{Array.from({ length: 2 }).map((_, j) => (
								<div key={`field-${j}`} className='space-y-2'>
									<Skeleton className='h-4 w-32' />
									<Skeleton className='h-10 w-full rounded-md' />
								</div>
							))}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// Admin Layout Skeleton (for initial auth check)
// Admin Layout Skeleton - matches DashboardLayout structure with SidebarProvider
export function AdminLayoutSkeleton() {
	return (
		<SidebarProvider defaultOpen={true}>
			{/* Sidebar Skeleton - AppSidebar structure */}
			<aside className='hidden md:flex md:w-64 md:flex-col md:border-r bg-sidebar'>
				{/* Sidebar Header */}
				<div className='flex h-16 items-center border-b px-4'>
					<Skeleton className='h-6 w-32' />
				</div>
				
				{/* Sidebar Content */}
				<div className='flex-1 overflow-y-auto p-4 space-y-4'>
					{/* Navigation Groups */}
					{Array.from({ length: 3 }).map((_, groupIndex) => (
						<div key={`group-${groupIndex}`} className='space-y-2'>
							<Skeleton className='h-4 w-20 mb-2' />
							{Array.from({ length: 4 }).map((_, itemIndex) => (
								<div key={`item-${itemIndex}`} className='flex items-center gap-3 p-2 rounded-md'>
									<Skeleton className='h-4 w-4 rounded' />
									<Skeleton className='h-4 w-24' />
								</div>
							))}
						</div>
					))}
				</div>
				
				{/* Sidebar Footer */}
				<div className='border-t p-4'>
					<div className='flex items-center gap-3 p-2'>
						<Skeleton className='h-8 w-8 rounded-full' />
						<div className='flex-1 space-y-1'>
							<Skeleton className='h-3 w-24' />
							<Skeleton className='h-3 w-32' />
						</div>
					</div>
				</div>
			</aside>

			<SidebarInset>
				{/* Header Skeleton */}
				<header className='flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
					<div className='flex gap-2 items-center px-4 flex-1 min-w-0'>
						{/* Sidebar Trigger */}
						<Skeleton className='h-8 w-8 rounded-md -ml-1' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						
						{/* Breadcrumbs */}
						<div className='flex items-center gap-2'>
							<Skeleton className='h-4 w-20' />
							<Skeleton className='h-4 w-1' />
							<Skeleton className='h-4 w-24' />
						</div>
					</div>

					{/* Right side controls */}
					<div className='flex items-center gap-2 px-4'>
						<Skeleton className='h-8 w-8 rounded-md' />
					</div>
				</header>

				{/* Main Content */}
				<main className='flex flex-col flex-1'>
					<div className='flex-1 p-4 pt-6 space-y-4 md:p-8'>
						{/* Page Header */}
						<div className='space-y-2 mb-6'>
							<Skeleton className='h-8 w-48' />
							<Skeleton className='h-4 w-64' />
						</div>

						{/* Content Area */}
						<div className='space-y-6'>
							{Array.from({ length: 3 }).map((_, i) => (
								<Card key={`content-${i}`}>
									<CardHeader>
										<Skeleton className='h-6 w-32' />
									</CardHeader>
									<CardContent className='space-y-3'>
										<Skeleton className='h-4 w-full' />
										<Skeleton className='h-4 w-5/6' />
										<Skeleton className='h-4 w-4/6' />
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

// Generic Page Skeleton - refined for better visual structure
export function PageSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-9 w-48 mb-2' />
					<Skeleton className='h-4 w-64' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-24 rounded-md' />
					<Skeleton className='h-10 w-32 rounded-md' />
				</div>
			</div>

			{/* Filters Card */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<Skeleton className='h-10 flex-1 rounded-md' />
						<Skeleton className='h-10 w-full sm:w-48 rounded-md' />
					</div>
				</CardContent>
			</Card>

			{/* Content Card */}
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-40' />
				</CardHeader>
				<CardContent className='space-y-4'>
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={`row-${i}`} className='flex items-center gap-4'>
							<Skeleton className='h-4 w-4 rounded' />
							<Skeleton className='h-4 flex-1' />
							<Skeleton className='h-6 w-20 rounded-full' />
							<Skeleton className='h-8 w-8 rounded-md' />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
