// Sentry must be initialized before everything else
import './instrument';
import { initSentry } from './instrument';
initSentry();

import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import { join } from "path";
import helmet from "helmet";
import { WinstonModule } from "nest-winston";
import { createWinstonConfig } from "./core/logging/winston.config";

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: WinstonModule.createLogger(createWinstonConfig(nodeEnv)),
  });

  // Security: Helmet middleware for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Body parser with raw body for webhook signature verification
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

  // URI-based API Versioning — /api/v1/... (legacy /api/... still works via defaultVersion)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-correlation-id'],
    exposedHeaders: ['x-correlation-id'],
  });

  // Static files
  app.use("/public", express.static(join(__dirname, "..", "public")));
  app.use("/widget", express.static(join(__dirname, "..", "public", "widget")));

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("BizNavigate API")
    .setDescription(
      "Lead Management System API — WhatsApp automation, CRM, e-commerce, and AI agents"
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`/`, 'Default (unversioned)')
    .addServer(`/v1`, 'v1')
    .addTag("Authentication", "Signup, login, refresh, logout")
    .addTag("Leads", "Lead management")
    .addTag("Tenants", "Tenant management")
    .addTag("Businesses", "Business management")
    .addTag("Users", "User management")
    .addTag("Roles", "RBAC management")
    .addTag("Subscriptions", "Subscription plans")
    .addTag("Analytics", "Reporting & analytics")
    .addTag("Campaigns", "WhatsApp marketing campaigns")
    .addTag("Chat Widget", "Website chat widget")
    .addTag("Health", "System health checks")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
