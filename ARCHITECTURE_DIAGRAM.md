# WhatsApp Bot - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         WHATSAPP USER                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ (Message via Twilio)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TWILIO WHATSAPP API                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /whatsapp/webhook
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              WHATSAPP BOT CONTROLLER                            │
│                 (Entry Point)                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MESSAGE HANDLER SERVICE                            │
│           (Middleware Pipeline Executor)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │    MIDDLEWARE PIPELINE (Ordered)       │
        └────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│   LOGGING    │    │ RATE LIMITING │    │   SESSION    │
│  Middleware  │───▶│   Middleware  │───▶│  Middleware  │
└──────────────┘    └───────────────┘    └──────┬───────┘
                                                 │
                    ┌────────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │  CONVERSATION FLOW    │
        │     Middleware        │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   ERROR HANDLER       │
        │     Middleware        │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────┐
        │         CONVERSATION HANDLER SERVICE          │
        │      (Business Logic - Existing Code)         │
        └───────────────┬───────────────────────────────┘
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
┌──────────────┐ ┌─────────────┐ ┌─────────────┐
│ State Machine│ │   Product   │ │   Session   │
│   Service    │ │   Matcher   │ │   Service   │
└──────────────┘ └─────────────┘ └──────┬──────┘
                                         │
                                         ▼
                                 ┌───────────────┐
                                 │  REDIS CACHE  │
                                 └───────────────┘
```

## 📋 Feature Modules (DDD Bounded Contexts)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE MODULES                              │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │         ORDERS FEATURE                      │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Domain: Order Entity                │   │
        │    │  │  - addItem(), confirm(), cancel()    │   │
        │    │  └──────────────────────────────────────┘   │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Application: CQRS Commands          │   │
        │    │  │  - CreateOrderCommand                │   │
        │    │  │  - ConfirmOrderCommand               │   │
        │    │  │  - CancelOrderCommand                │   │
        │    │  └──────────────────────────────────────┘   │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Service: Order Service              │   │
        │    │  │  - createOrder(), confirmOrder()     │   │
        │    │  └──────────────────────────────────────┘   │
        │    └─────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │         INVOICES FEATURE                    │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Domain: Invoice Entity              │   │
        │    │  │  - issue(), markAsPaid()             │   │
        │    │  └──────────────────────────────────────┘   │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Service: Invoice Service            │   │
        │    │  │  - generateFromOrder()               │   │
        │    │  │  - sendInvoice()                     │   │
        │    │  └──────────────────────────────────────┘   │
        │    └─────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │         REMINDERS FEATURE                   │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Domain: Reminder Entity             │   │
        │    │  │  - isReadyToSend(), markAsSent()     │   │
        │    │  └──────────────────────────────────────┘   │
        │    │  ┌──────────────────────────────────────┐   │
        │    │  │  Service: Reminder Service           │   │
        │    │  │  - scheduleReminder()                │   │
        │    │  │  - schedulePaymentReminder()         │   │
        │    │  └──────────────────────────────────────┘   │
        │    └─────────────────────────────────────────────┘
        │
        └──▶ ┌─────────────────────────────────────────────┐
             │         CAMPAIGNS FEATURE                   │
             │  ┌──────────────────────────────────────┐   │
             │  │  Domain: Campaign Entity             │   │
             │  │  - start(), pause(), complete()      │   │
             │  └──────────────────────────────────────┘   │
             │  ┌──────────────────────────────────────┐   │
             │  │  Service: Campaign Service           │   │
             │  │  - createCampaign()                  │   │
             │  │  - startCampaign()                   │   │
             │  │  - getCampaignMetrics()              │   │
             │  └──────────────────────────────────────┘   │
             └─────────────────────────────────────────────┘
```

## 🔄 Background Job Processing (BullMQ)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULLMQ JOB QUEUES                            │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │   ORDER PROCESSING QUEUE                    │
        │    │                                             │
        │    │   Job: process-order                        │
        │    │   ├── Get order details                     │
        │    │   ├── Generate invoice                      │
        │    │   └── Send invoice to customer              │
        │    │                                             │
        │    │   Worker: OrderProcessingWorker             │
        │    └─────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │   INVOICE PROCESSING QUEUE                  │
        │    │                                             │
        │    │   Job: send-invoice                         │
        │    │   ├── Format invoice for WhatsApp           │
        │    │   └── Send via Twilio                       │
        │    │                                             │
        │    │   Worker: InvoiceWorker                     │
        │    └─────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │   REMINDERS QUEUE                           │
        │    │                                             │
        │    │   Job: send-reminder (Delayed)              │
        │    │   ├── Check if ready to send                │
        │    │   ├── Send via WhatsApp                     │
        │    │   └── Mark as sent                          │
        │    │                                             │
        │    │   Worker: ReminderWorker                    │
        │    └─────────────────────────────────────────────┘
        │
        └──▶ ┌─────────────────────────────────────────────┐
             │   CAMPAIGNS QUEUE                           │
             │                                             │
             │   Job: send-campaign-message (Batched)      │
             │   ├── Personalize message                   │
             │   ├── Send to recipient                     │
             │   └── Track delivery                        │
             │                                             │
             │   Worker: CampaignWorker                    │
             └─────────────────────────────────────────────┘
                             │
                             ▼
                     ┌───────────────┐
                     │  REDIS QUEUE  │
                     │    STORAGE    │
                     └───────────────┘
```

## 🔌 External Services (Circuit Breaker Protected)

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │        TWILIO WHATSAPP API                  │
        │    │                                             │
        │    │   Circuit Breaker: ON                       │
        │    │   ├── State: CLOSED/OPEN/HALF-OPEN          │
        │    │   ├── Failure Threshold: 5                  │
        │    │   ├── Timeout: 10s                          │
        │    │   └── Fallback: Queue for retry             │
        │    │                                             │
        │    │   Methods:                                  │
        │    │   - sendMessage()                           │
        │    │   - sendTemplate()                          │
        │    └─────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │        ZOHO CRM API                         │
        │    │                                             │
        │    │   Circuit Breaker: ON                       │
        │    │   ├── State: CLOSED/OPEN/HALF-OPEN          │
        │    │   ├── Failure Threshold: 5                  │
        │    │   ├── Timeout: 10s                          │
        │    │   └── Fallback: Cached data                 │
        │    │                                             │
        │    │   Methods:                                  │
        │    │   - fetchInventory()                        │
        │    │   - syncOrders()                            │
        │    └─────────────────────────────────────────────┘
        │
        └──▶ ┌─────────────────────────────────────────────┐
             │        AI/ML SERVICES (Future)              │
             │                                             │
             │   Circuit Breaker: ON                       │
             │   - Product recommendations                 │
             │   - Chatbot responses                       │
             │   - Sentiment analysis                      │
             └─────────────────────────────────────────────┘
```

## 💾 Data Storage Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA STORAGE                                │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──▶ ┌─────────────────────────────────────────────┐
        │    │      POSTGRESQL (Prisma ORM)                │
        │    │                                             │
        │    │   Tables:                                   │
        │    │   ├── shops (customers)                     │
        │    │   ├── products                              │
        │    │   ├── inventory_current                     │
        │    │   ├── whatsappMessage (logs, entities)      │
        │    │   └── ConversationSession                   │
        │    │                                             │
        │    │   Stored as JSON in whatsappMessage:        │
        │    │   - Orders (messageSid: 'order:*')          │
        │    │   - Invoices (messageSid: 'invoice:*')      │
        │    │   - Reminders (messageSid: 'reminder:*')    │
        │    │   - Campaigns (messageSid: 'campaign:*')    │
        │    └─────────────────────────────────────────────┘
        │
        └──▶ ┌─────────────────────────────────────────────┐
             │         REDIS (In-Memory Cache)             │
             │                                             │
             │   Keys:                                     │
             │   ├── whatsapp:session:*  (Sessions)        │
             │   ├── rate_limit:*        (Rate limits)     │
             │   ├── user_exists:*       (User cache)      │
             │   ├── processed:*         (Deduplication)   │
             │   └── bull:*              (Job queues)      │
             │                                             │
             │   TTL: 5min - 24hr depending on type        │
             └─────────────────────────────────────────────┘
```

## 📊 Message Flow Example: Order Placement

```
┌──────────┐                    ┌────────────────┐
│ Customer │                    │  WhatsApp Bot  │
└────┬─────┘                    └───────┬────────┘
     │                                  │
     │  1. "Cement x 100"               │
     │─────────────────────────────────▶│
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Logging        │
     │                          │ Middleware     │
     │                          └───────┬────────┘
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Rate Limit     │
     │                          │ Middleware     │
     │                          └───────┬────────┘
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Session        │
     │                          │ Middleware     │
     │                          │ (Get/Create)   │
     │                          └───────┬────────┘
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Conversation   │
     │                          │ Flow           │
     │                          │ - Parse input  │
     │                          │ - Match        │
     │                          │   products     │
     │                          │ - Calculate    │
     │                          │   total        │
     │                          └───────┬────────┘
     │                                  │
     │  2. "Order Summary              │
     │      Total: ₹5,000"              │
     │◀─────────────────────────────────│
     │                                  │
     │  3. "1" (Confirm)                │
     │─────────────────────────────────▶│
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Create Order   │
     │                          │ Command        │
     │                          └───────┬────────┘
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Order Service  │
     │                          │ - Save order   │
     │                          └───────┬────────┘
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Queue Job:     │
     │                          │ process-order  │
     │                          └───────┬────────┘
     │                                  │
     │  4. "Order confirmed!"           │
     │◀─────────────────────────────────│
     │                                  │
     │                          ┌───────▼────────┐
     │                          │ Background:    │
     │                          │ - Generate     │
     │                          │   invoice      │
     │                          │ - Send invoice │
     │                          └───────┬────────┘
     │                                  │
     │  5. "Invoice INV-123"            │
     │     (Auto-sent)                  │
     │◀─────────────────────────────────│
     │                                  │
```

## 🎯 Scalability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                                │
│                  (NGINX / AWS ALB)                              │
└───────────────┬─────────────────────────┬───────────────────────┘
                │                         │
    ┌───────────▼──────────┐  ┌──────────▼───────────┐
    │  WhatsApp Bot        │  │  WhatsApp Bot        │
    │  Instance 1          │  │  Instance 2          │
    │  (Stateless)         │  │  (Stateless)         │
    └───────────┬──────────┘  └──────────┬───────────┘
                │                         │
                └─────────────┬───────────┘
                              │
                ┌─────────────▼──────────────┐
                │   SHARED REDIS CLUSTER     │
                │   - Session storage        │
                │   - Rate limiting          │
                │   - Job queues             │
                └─────────────┬──────────────┘
                              │
                ┌─────────────▼──────────────┐
                │  POSTGRESQL CLUSTER        │
                │  - Master (Write)          │
                │  - Replica (Read)          │
                └────────────────────────────┘
```

## 📈 Performance Optimizations

```
┌─────────────────────────────────────────────────────────────────┐
│                PERFORMANCE OPTIMIZATIONS                        │
└─────────────────────────────────────────────────────────────────┘

1. REDIS CACHING
   ├── User existence checks (TTL: 5min)
   ├── Product catalog (TTL: 1hr)
   ├── Organization data (TTL: 1hr)
   └── Session data (TTL: 24hr)

2. DATABASE OPTIMIZATION
   ├── Connection pooling (max: 20)
   ├── Indexed queries (product_id, organization_id)
   ├── Query optimization (Prisma)
   └── Read replicas for queries

3. MIDDLEWARE PIPELINE
   ├── Early exit on rate limit
   ├── Cached session lookups
   ├── Async logging
   └── Non-blocking error handling

4. JOB QUEUE OPTIMIZATION
   ├── Batch processing (campaigns)
   ├── Priority queues
   ├── Exponential backoff
   └── Job deduplication

5. CIRCUIT BREAKER
   ├── Prevent cascade failures
   ├── Automatic recovery
   ├── Fallback responses
   └── Request timeouts
```

---

**This architecture is:**
- ✅ **Scalable** - Horizontal scaling with stateless design
- ✅ **Resilient** - Circuit breakers, retries, error handling
- ✅ **Maintainable** - Clean code, DDD, SOLID principles
- ✅ **Performant** - Caching, async processing, optimizations
- ✅ **Production-Ready** - Monitoring, logging, health checks
