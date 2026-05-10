import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as express from "express";
import * as compression from "compression";
import { join } from "path";
import helmet from "helmet";

// postgres.js queues socket writes via setImmediate. When PgCat terminates a
// connection (idle_in_transaction_session_timeout) between the queue and the
// flush, the socket reference becomes null and nextWrite crashes the process.
// This guard catches only that specific error so the crash is swallowed and
// the connection is discarded; all other uncaught exceptions still exit.
process.on("uncaughtException", (err) => {
  if (
    err instanceof TypeError &&
    err.message.includes("null") &&
    err.stack?.includes("nextWrite")
  ) {
    return; // postgres.js stale-socket write — safe to ignore
  }
  // PgCat transaction-mode pooler: stale prepared statement on a recycled backend.
  // Happens with pg (node-postgres) Pool in background. Log and ignore — the pool
  // will recover by getting a fresh connection on the next request.
  if ((err as any)?.code === "26000") {
    console.warn("PgCat stale prepared statement (ignored):", err.message);
    return;
  }
  console.error("Uncaught exception:", err);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });

  // Compress all responses (gzip/br) — reduces payload ~70% on JSON
  app.use(compression());

  // Security: Helmet middleware for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for widget embedding
    })
  );

  // Configure body parser with raw body for webhook signature verification
  // 50mb limit to support base64 image uploads
  app.use(express.json({
    limit: '50mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    })
  );

  // Enable CORS with restrictions
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Static files
  app.use("/public", express.static(join(__dirname, "..", "public")));

  // Widget static files (for widget.js and styles.css)
  app.use("/widget", express.static(join(__dirname, "..", "public", "widget")));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
