import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate a server-side error
    throw new Error('Test Server-Side Error from API Route');
  } catch (error) {
    // Sentry temporarily disabled for deployment
    console.error('Server error (would be sent to Sentry):', error);

    // Return a response
    return NextResponse.json(
      {
        message: 'Server error captured! (Sentry currently disabled)',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

