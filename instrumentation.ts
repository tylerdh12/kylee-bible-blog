// Temporarily disabled to fix React context issue
// export async function register() {
//   try {
//     if (process.env.NEXT_RUNTIME === 'nodejs') {
//       await import('./sentry.server.config');
//     }

//     if (process.env.NEXT_RUNTIME === 'edge') {
//       await import('./sentry.edge.config');
//     }
//   } catch (error) {
//     console.warn('Failed to initialize Sentry:', error);
//   }
// }
