import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-new';

/**
 * API route to check if current user is an admin
 * Used by middleware or other server-side checks
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
