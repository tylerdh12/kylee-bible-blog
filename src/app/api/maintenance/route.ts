import { NextResponse } from 'next/server';
import { isMaintenanceMode } from '@/lib/settings';

// Simple API endpoint to check maintenance mode
// Used by middleware in Edge runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
	try {
		const maintenanceMode = await isMaintenanceMode();
		return NextResponse.json(
			{ maintenanceMode },
			{
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0',
				},
			}
		);
	} catch (error) {
		console.error('Error checking maintenance mode:', error);
		// Default to false if we can't check (fail open)
		return NextResponse.json(
			{ maintenanceMode: false },
			{
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
				},
			}
		);
	}
}
