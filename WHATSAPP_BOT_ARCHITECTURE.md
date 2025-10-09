# WhatsApp Bot Architecture Documentation

## Overview

This is an enterprise-grade WhatsApp bot built with NestJS, following industrial standards and best practices. The bot handles order management, invoicing, reminders, and marketing campaigns via WhatsApp.

## Architecture Patterns

### 1. **Hexagonal Architecture (Ports & Adapters)**
- **Domain Layer**: Pure business logic (entities, value objects)
- **Application Layer**: Use cases, commands, services
- **Infrastructure Layer**: External services, databases, APIs

### 2. **CQRS (Command Query Responsibility Segregation)**
- Commands: `CreateOrderCommand`, `ConfirmOrderCommand`, `CancelOrderCommand`
- Queries: Separate read models for performance

### 3. **Middleware Pipeline**
- Extensible message processing pipeline
- Ordered middleware execution
- Clean separation of concerns

### 4. **Circuit Breaker Pattern**
- Protects against cascading failures
- Automatic recovery detection
- Fallback mechanisms

### 5. **Domain-Driven Design**
- Rich domain models with business logic
- Aggregates enforce invariants
- Clear bounded contexts

## Module Structure

```
whatsapp-bot/
├── core/                           # Core messaging infrastructure
│   ├── message-context.ts         # Message context object
│   ├── message-handler.service.ts # Main message handler
│   ├── circuit-breaker.ts         # Circuit breaker implementation
│   └── middleware/                # Middleware components
│       ├── middleware-pipeline.ts
│       ├── rate-limit.middleware.ts
│       ├── session.middleware.ts
│       ├── logging.middleware.ts
│       ├── error-handler.middleware.ts
│       └── conversation-flow.middleware.ts
│
├── features/                       # Feature modules (DDD bounded contexts)
│   ├── orders/                    # Order management
│   │   ├── domain/
│   │   │   └── order.entity.ts   # Order aggregate root
│   │   └── application/
│   │       ├── commands/          # CQRS commands
│   │       └── services/
│   │           └── order.service.ts
│   │
│   ├── invoices/                  # Invoice generation
│   │   ├── domain/
│   │   │   └── invoice.entity.ts
│   │   └── application/
│   │       └── services/
│   │           └── invoice.service.ts
│   │
│   ├── reminders/                 # Scheduled reminders
│   │   ├── domain/
│   │   │   └── reminder.entity.ts
│   │   └── application/
│   │       └── services/
│   │           └── reminder.service.ts
│   │
│   └── campaigns/                 # Marketing campaigns
│       ├── domain/
│       │   └── campaign.entity.ts
│       └── application/
│           └── services/
│               └── campaign.service.ts
│
├── workers/                        # BullMQ background workers
│   ├── order-processing.worker.ts
│   ├── invoice.worker.ts
│   ├── reminder.worker.ts
│   └── campaign.worker.ts
│
└── controllers/                    # API endpoints
    └── whatsapp-bot.controller.ts
```

## Core Components

### Message Pipeline

The message pipeline processes all incoming WhatsApp messages through middleware:

```
Incoming Message
    ↓
[Logging Middleware] ──→ Log message, track metrics
    ↓
[Rate Limit Middleware] ──→ Check user rate limits
    ↓
[Session Middleware] ──→ Get/create user session
    ↓
[Conversation Flow Middleware] ──→ Handle conversation logic
    ↓
[Error Handler Middleware] ──→ Catch and handle errors
    ↓
Response Sent
```

**Middleware Order**:
1. Logging (400)
2. Rate Limiting (100)
3. Session Management (300)
4. Conversation Flow (1000)
5. Error Handling (9999)

### Domain Entities

#### Order Entity
```typescript
class Order {
  - id: string
  - items: OrderItem[]
  - status: OrderStatus
  - totalAmount: number

  + addItem(item: OrderItem): void
  + confirm(): void
  + cancel(reason?: string): void
  + markAsShipped(trackingNumber?: string): void
}
```

**Business Rules**:
- Only DRAFT orders can be modified
- Cannot confirm empty order
- Cannot cancel DELIVERED orders
- Total is auto-calculated on item changes

#### Invoice Entity
```typescript
class Invoice {
  - invoiceNumber: string
  - lineItems: InvoiceLineItem[]
  - status: InvoiceStatus
  - totalAmount: number

  + issue(): void
  + markAsPaid(): void
  + isOverdue(): boolean
}
```

#### Reminder Entity
```typescript
class Reminder {
  - type: ReminderType
  - message: string
  - scheduledFor: Date
  - status: ReminderStatus

  + isReadyToSend(): boolean
  + markAsSent(): void
  + cancel(): void
}
```

#### Campaign Entity
```typescript
class Campaign {
  - name: string
  - message: string
  - targetAudience: TargetAudience
  - metrics: CampaignMetrics

  + start(totalRecipients: number): void
  + pause(): void
  + complete(): void
}
```

## Features

### 1. Order Management

**Flow**:
1. Customer sends product list via WhatsApp
2. Bot parses and matches products
3. Shows order confirmation
4. Customer confirms
5. Order created → Invoice generated → Invoice sent

**Commands**:
- `CreateOrderCommand`
- `ConfirmOrderCommand`
- `CancelOrderCommand`

**Endpoints**:
- `GET /whatsapp/orders/:orderId` - Get order details
- Order processing happens automatically via webhook

### 2. Invoice Generation

**Features**:
- Auto-generation from orders
- Formatted WhatsApp messages
- Payment tracking
- Overdue detection

**Flow**:
1. Order confirmed
2. Invoice generated with line items, tax, discounts
3. Invoice sent to customer
4. Payment reminders if overdue

**Endpoints**:
- `GET /whatsapp/invoices/:invoiceId` - Get invoice

### 3. Reminders System

**Types**:
- `PAYMENT_DUE` - Payment due reminders
- `CART_ABANDONED` - Abandoned cart recovery
- `ORDER_FOLLOWUP` - Order follow-up
- `RESTOCK` - Product restock notifications
- `CUSTOM` - Custom reminders

**Scheduling**:
```typescript
await reminderService.scheduleReminder({
  organizationId: 'org-123',
  customerId: 'cust-456',
  customerPhone: '+1234567890',
  type: ReminderType.PAYMENT_DUE,
  message: 'Payment reminder message',
  scheduledFor: new Date('2025-01-15T10:00:00'),
});
```

**Endpoints**:
- `POST /whatsapp/reminders` - Schedule reminder

### 4. Campaign Management

**Features**:
- Broadcast messaging
- Audience targeting
- Personalization ({{name}}, etc.)
- Real-time metrics
- Pause/Resume campaigns

**Campaign Types**:
- `PROMOTIONAL` - Sales, discounts
- `TRANSACTIONAL` - Order updates
- `ANNOUNCEMENT` - New products, events
- `FEEDBACK` - Customer feedback requests
- `REENGAGEMENT` - Win back customers

**Targeting**:
```typescript
const targetAudience = {
  type: 'segment',
  filters: {
    lastOrderDate: { from: '2024-01-01' },
    totalSpent: { min: 1000 },
  }
};
```

**Endpoints**:
- `POST /whatsapp/campaigns` - Create campaign
- `GET /whatsapp/campaigns/:id/metrics` - Get metrics

## Background Jobs (BullMQ)

### Queues

1. **order-processing**: Order workflow automation
2. **invoice-processing**: Invoice generation and delivery
3. **reminders**: Scheduled reminder delivery
4. **campaigns**: Campaign message broadcasting

### Workers

All workers implement:
- Automatic retries with exponential backoff
- Error handling and logging
- Metrics tracking

## Rate Limiting

**Strategy**: Token Bucket Algorithm

**Limits**:
- Per User: 30 requests/minute (burst: 5)
- Per Organization: 1000 requests/minute
- Global: 10,000 requests/minute

**Configuration**:
```typescript
// src/integrations/whatsapp/core/middleware/rate-limit.middleware.ts
private readonly limits = {
  perUser: { requests: 30, window: 60, burst: 5 },
  perOrganization: { requests: 1000, window: 60 },
  global: { requests: 10000, window: 60 },
};
```

## Circuit Breaker

**States**:
- `CLOSED`: Normal operation
- `OPEN`: Service failing, reject requests
- `HALF-OPEN`: Testing recovery

**Configuration**:
```typescript
new CircuitBreaker('ServiceName', {
  failureThreshold: 5,      // Failures before opening
  successThreshold: 2,       // Successes to close from half-open
  timeout: 10000,            // Request timeout (ms)
  resetTimeout: 60000,       // Time before attempting reset (ms)
});
```

**Usage**:
```typescript
class ZohoServiceClient extends ExternalServiceClient {
  async fetchData() {
    return this.executeWithCircuitBreaker(
      () => this.zohoApi.getData(),
      () => this.getCachedData() // Fallback
    );
  }
}
```

## Error Handling

**Strategy**: Layered error handling

1. **Middleware Level**: Catch and categorize errors
2. **Service Level**: Business logic errors
3. **Worker Level**: Job retry mechanisms

**Error Categories**:
- Rate Limit Errors → User-friendly message
- Validation Errors → Input correction guidance
- External Service Errors → Retry or fallback
- Unknown Errors → Generic message + alert

## Session Management

**Storage**: Redis

**TTL**: 24 hours

**Structure**:
```typescript
interface ConversationSession {
  sessionId: string;
  userId: string;
  currentStep: ConversationStep;
  context: ConversationContext;
  metadata: SessionMetadata;
  expiresAt: Date;
}
```

**Cleanup**: Automatic cleanup every 30 minutes

## Monitoring & Metrics

### Health Check

`GET /whatsapp/health`

```json
{
  "status": "healthy",
  "services": {
    "messageHandler": "operational",
    "redis": "operational",
    "database": "operational"
  }
}
```

### Metrics (Future Enhancement)

- Message throughput
- Response time percentiles
- Error rates
- Queue depths
- Circuit breaker states

## Security

### Rate Limiting
- Token bucket algorithm
- Per-user, per-org, and global limits
- Redis-backed counters

### Input Validation
- Message sanitization
- Product parsing with safety checks
- SQL injection prevention (Prisma)

### Authentication
- Webhook signature verification
- Verify token for webhook setup

## Scalability

### Horizontal Scaling
- Stateless message handlers
- Redis for shared state
- BullMQ for distributed job processing

### Performance Optimizations
- Redis caching for user lookups
- Database connection pooling
- Batch processing for campaigns
- Middleware pipeline for efficiency

## Testing Strategy

### Unit Tests
- Domain entities (business logic)
- CQRS command handlers
- Middleware components

### Integration Tests
- Order workflow end-to-end
- Invoice generation
- Reminder scheduling
- Campaign execution

### E2E Tests
- Complete user flows via webhook
- Multi-step conversations
- Error scenarios

## Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Twilio WhatsApp
TWILIO_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
WHATSAPP_VERIFY_TOKEN=...

# Features
ENABLE_CAMPAIGNS=true
ENABLE_REMINDERS=true
```

### Starting the Bot

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Start development server
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Future Enhancements

1. **Analytics Dashboard** - Real-time metrics visualization
2. **A/B Testing** - Campaign message variants
3. **ML-Powered Recommendations** - Product suggestions
4. **Multi-language Support** - Internationalization
5. **Payment Integration** - WhatsApp Pay, UPI
6. **AI Chatbot** - GPT-powered responses
7. **Rich Media** - Images, PDFs, catalogs
8. **Webhook Signatures** - Enhanced security
9. **Audit Logs** - Compliance and debugging
10. **Admin Dashboard** - Campaign/reminder management UI

## API Reference

### Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/whatsapp/webhook` | Webhook verification |
| POST | `/whatsapp/webhook` | Incoming message handler |

### Order Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/whatsapp/orders/:orderId` | Get order details |

### Invoice Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/whatsapp/invoices/:invoiceId` | Get invoice |

### Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/whatsapp/reminders` | Schedule reminder |

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/whatsapp/campaigns` | Create campaign |
| GET | `/whatsapp/campaigns/:id/metrics` | Get metrics |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/whatsapp/health` | Health check |

## Support & Troubleshooting

### Common Issues

**1. Messages not being processed**
- Check webhook URL configuration in Twilio
- Verify WHATSAPP_VERIFY_TOKEN
- Check logs for errors

**2. Rate limit errors**
- Adjust limits in rate-limit.middleware.ts
- Check Redis connectivity

**3. Queue jobs stuck**
- Check Redis connection
- Verify BullMQ configuration
- Review worker logs

**4. Circuit breaker open**
- Check external service health
- Review circuit breaker metrics
- Manually reset if needed

### Logging

Logs include:
- Request/response tracking
- Error stack traces
- Performance metrics
- Business events

**Log Levels**:
- `ERROR`: Critical failures
- `WARN`: Recoverable issues
- `LOG`: Important events
- `DEBUG`: Detailed diagnostics

## Contributing

When adding new features:

1. Follow DDD principles
2. Add domain entities in `features/{feature}/domain`
3. Create commands/queries in `application`
4. Implement services
5. Add workers for async tasks
6. Write tests
7. Update documentation

## License

Proprietary - All rights reserved
