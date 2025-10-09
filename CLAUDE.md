# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a NestJS-based order automation system that handles WhatsApp messaging integrated with CRM systems (Zoho). The project follows Clean Architecture principles with feature-based organization.

## Development Commands

### Core Development
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm start` - Start production server
- `npm run start:prod` - Start production server from dist

### Database Management
- `npm run prisma:generate` - Generate Prisma client after schema changes
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio for database management

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## Architecture Overview

### Clean Architecture Layers
Each feature follows a 3-layer architecture:
1. **Domain Layer** (`src/features/{feature}/domain/`) - Pure business logic, entities, repository interfaces
2. **Application Layer** (`src/features/{feature}/application/`) - Use cases, services, DTOs
3. **Infrastructure Layer** (`src/features/{feature}/infrastructure/`) - Controllers, repository implementations, external services

### Key Modules
- **WhatsApp Integration** (`src/integrations/whatsapp/`) - Handles WhatsApp messaging via Twilio
- **CRM Integration** (`src/integrations/crm/zoho/`) - Zoho CRM synchronization
- **Conversation Management** - State machine-based conversation handling with Redis session storage
- **Inventory Management** - Product catalog and stock management with multi-source sync
- **Job Processing** - BullMQ for background jobs (inbound/outbound processors)

### Database Schema
- **PostgreSQL** with Prisma ORM
- Key entities: `products`, `inventory_current`, `ConversationSession`, `whatsappMessage`, `business_user`, `zoho_user_credential`
- Generated Prisma client in `generated/prisma/`

### State Management
- **Conversation States**: Managed by `ConversationStateMachineService` with Redis persistence
- **Session Storage**: Redis-based session management for WhatsApp conversations
- **Background Jobs**: BullMQ for processing inbound/outbound messages

## Key Patterns & Conventions

### Module Structure
Each feature module includes:
- Module definition (`{feature}.module.ts`)
- Controller (infrastructure layer)
- Service (application layer)
- Entity (domain layer)
- DTOs for API contracts

### Integration Services
- **ZohoService**: OAuth-based API integration with token refresh
- **WhatsAppService**: Twilio API wrapper for messaging
- **ConversationHandlerService**: Business logic for message processing

### Error Handling
- Global exception filter (`src/common/filters/global-exception.filter.ts`)
- Custom exceptions in `src/common/exceptions/`

## Environment Setup

### Required Environment Variables
See README.md for complete list. Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST/REDIS_PORT` - Redis configuration
- `TWILIO_SID/TWILIO_AUTH_TOKEN` - Twilio credentials
- `ZOHO_CLIENT_ID/ZOHO_CLIENT_SECRET` - Zoho OAuth credentials

### Initial Setup
```bash
npm install
npx prisma db pull
npx prisma generate
npm run start:dev
```

## Important Notes

### Database Changes
Always run `npm run prisma:generate` after modifying `prisma/schema.prisma` to regenerate the client.

### Redis Dependency
Redis is required for session management and job queues. Ensure Redis is running before starting the application.

### Webhook Configuration
WhatsApp integration requires webhook URLs to be configured in Twilio console for message handling.

### Testing Strategy
- Unit tests for domain entities and application services
- Integration tests for repository implementations
- E2E tests for complete workflows through controllers

### Code Quality
The project uses ESLint and Prettier. Always run linting before commits to maintain code standards.