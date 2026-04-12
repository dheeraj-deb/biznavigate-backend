/**
 * Sentry instrumentation — must be imported at the very top of main.ts,
 * before any other imports, so Sentry can instrument all modules.
 * */
import * as Sentry from '@sentry/nestjs';

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // Sentry is optional — skip if not configured

  const isProd = process.env.NODE_ENV === 'production';

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: isProd
      ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1')
      : 1.0,
    integrations: [Sentry.httpIntegration()],
    beforeSend(event) {
      // Strip sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });
}
