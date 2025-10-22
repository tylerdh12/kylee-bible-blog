import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate a server-side error
    throw new Error('Test Server-Side Error from API Route');
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error);
    
    // Return a response
    return NextResponse.json(
      { 
        message: 'Server error captured! Check your Sentry dashboard.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

