'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentryTestPage() {
  const testClientError = () => {
    try {
      throw new Error('Test Client-Side Error from Sentry Test Page');
    } catch (error) {
      // Sentry temporarily disabled for deployment
      console.error('Client error (would be sent to Sentry):', error);
      alert('Client error captured! (Sentry currently disabled)');
    }
  };

  const testServerError = async () => {
    try {
      const response = await fetch('/api/sentry-test-error');
      const data = await response.json();
      alert(data.message || 'Server error captured! Check your Sentry dashboard.');
    } catch (error) {
      console.error('Error testing server error:', error);
      alert('Failed to trigger server error');
    }
  };

  const testUncaughtError = () => {
    // This will trigger an uncaught error that Sentry will automatically capture
    throw new Error('Uncaught Test Error - This should be caught by Sentry');
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sentry Integration Test</CardTitle>
          <CardDescription>
            Use these buttons to test Sentry error tracking. Check your Sentry dashboard after clicking each button.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={testClientError} className="w-full">
              Test Client-Side Error (Caught)
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Triggers a caught error on the client side and manually sends it to Sentry.
            </p>
          </div>

          <div>
            <Button onClick={testServerError} variant="secondary" className="w-full">
              Test Server-Side Error
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Triggers an error on the server side via API route.
            </p>
          </div>

          <div>
            <Button onClick={testUncaughtError} variant="destructive" className="w-full">
              Test Uncaught Error (Will crash component)
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Triggers an uncaught error that Sentry will automatically capture. This will crash the component.
            </p>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click one of the buttons above to trigger an error</li>
              <li>Visit your Sentry dashboard at <a href="https://tyler-harper.sentry.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sentry.io</a></li>
              <li>Navigate to the kylee-blog project</li>
              <li>Check the Issues tab to see the captured error</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Important:</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Make sure you have set the <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">NEXT_PUBLIC_SENTRY_DSN</code> environment variable before testing. 
              See <code className="bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">SENTRY_SETUP.md</code> for instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

