import { NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    
    // Check for session cookie in headers for debugging
    if (process.env.NODE_ENV === 'development') {
      const cookieHeader = headersList.get('cookie');
      const hasSessionCookie = cookieHeader?.includes('better-auth.session_token') || 
                               cookieHeader?.includes('__Secure-better-auth.session_token');
      if (!hasSessionCookie) {
        console.log('[Auth Status] No session cookie found in request');
      }
    }
    
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth Status] No session found - returning 401');
      }
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get full user with role and isActive
    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        bio: true,
        website: true,
        image: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Prevent subscribers from having active sessions
    // Only ADMIN and DEVELOPER roles can authenticate
    if (user.role === 'SUBSCRIBER' || !user.role) {
      // Revoke the session if a subscriber somehow has one
      try {
        await auth.api.signOut({ headers: headersList });
      } catch (signOutError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Auth Status] Error revoking subscriber session:', signOutError);
        }
      }
      return NextResponse.json({ authenticated: false }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role as 'ADMIN' | 'DEVELOPER' | 'SUBSCRIBER') || 'SUBSCRIBER',
        isActive: user.isActive,
        avatar: user.avatar || user.image,
        bio: user.bio,
        website: user.website,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking auth status:', error);
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
