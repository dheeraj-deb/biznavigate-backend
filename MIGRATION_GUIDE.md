# Migration Guide - New WhatsApp Bot Architecture

## Overview

The new WhatsApp bot architecture coexists with your existing code. You can migrate gradually without breaking existing functionality.

## 🔄 Migration Strategy

### **Option 1: Run Both Systems in Parallel (Recommended)**

Keep both the old `WhatsAppModule` and new `WhatsAppBotModule` running simultaneously.

**Benefits:**
- Zero downtime
- Test new system with real traffic
- Gradual customer migration
- Easy rollback if needed

### **Option 2: Full Migration**

Replace old system entirely with new one.

**Benefits:**
- Clean codebase
- No duplicate code
- Immediate access to all new features

## 📋 Step-by-Step Migration (Option 1)

### **Step 1: Update app.module.ts**

```typescript
import { Module } from "@nestjs/common";
import { WhatsAppModule } from "./integrations/whatsapp/whatsapp.module"; // OLD
import { WhatsAppBotModule } from "./integrations/whatsapp/whatsapp-bot.module"; // NEW

@Module({
  imports: [
    // ... other modules
    WhatsAppModule,      // Keep old module for existing webhooks
    WhatsAppBotModule,   // Add new module for enhanced features
    // ... other modules
  ],
  // ...
})
export class AppModule {}
```

### **Step 2: Configure Dual Webhooks**

**Old webhook:** `POST /whatsapp/webhook` (existing)
**New webhook:** `POST /whatsapp/webhook` (new controller)

To avoid conflicts, rename one endpoint:

#### **Option A: Rename new endpoint**

```typescript
// In whatsapp-bot.controller.ts
@Controller('whatsapp-v2')  // Changed from 'whatsapp'
export class WhatsAppBotController {
  @Post('/webhook')  // Now accessible at /whatsapp-v2/webhook
  async handleWebhook(@Body() payload: any) {
    // ...
  }
}
```

Then update Twilio to point to: `https://your-domain.com/whatsapp-v2/webhook`

#### **Option B: Use environment variable routing**

```typescript
// In old whatsapp.controller.ts
@Controller('whatsapp')
export class WhatsAppController {
  @Post('/webhook')
  async handleWebhook(@Body() payload: any) {
    const useNewSystem = process.env.USE_NEW_WHATSAPP_BOT === 'true';

    if (useNewSystem) {
      // Forward to new system
      return this.messageHandler.handle({
        from: payload.From,
        to: payload.To,
        body: payload.Body,
        rawPayload: payload,
      });
    }

    // Use old system
    return await this.whatsAppService.handleWebhook(payload);
  }
}
```

### **Step 3: Test New Features**

Start by testing new features that don't exist in old system:

```bash
# Test campaign creation
curl -X POST http://localhost:3000/whatsapp-v2/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "test-org",
    "name": "Test Campaign",
    "message": "Test message {{name}}",
    "type": "PROMOTIONAL",
    "targetAudience": { "type": "all" },
    "startImmediately": true
  }'

# Test reminder scheduling
curl -X POST http://localhost:3000/whatsapp-v2/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "test-org",
    "customerId": "cust-123",
    "customerPhone": "+1234567890",
    "type": "PAYMENT_DUE",
    "message": "Test reminder",
    "scheduledFor": "2025-01-15T10:00:00Z"
  }'
```

### **Step 4: Gradual Customer Migration**

**Week 1-2: Testing**
- Route 10% of traffic to new system
- Monitor for errors
- Collect feedback

**Week 3-4: Scaling**
- Route 50% of traffic to new system
- Monitor performance metrics
- Fine-tune configuration

**Week 5+: Full Migration**
- Route 100% to new system
- Keep old system as backup
- Remove old system after 2 weeks

### **Step 5: Monitor Both Systems**

```typescript
// Add monitoring middleware
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MonitoringMiddleware implements MessageMiddleware {
  private readonly logger = new Logger(MonitoringMiddleware.name);

  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    const startTime = Date.now();

    await next();

    const duration = Date.now() - startTime;

    // Log metrics
    this.logger.log(`Message processed in ${duration}ms`, {
      contextId: context.id,
      from: context.from,
      handled: context.isHandled,
      error: context.error?.message,
    });

    // Send to monitoring service (DataDog, CloudWatch, etc.)
    // await this.metrics.record('message.processed', duration);
  }
}
```

## 🎯 Feature Comparison

| Feature | Old System | New System | Migration Priority |
|---------|-----------|------------|-------------------|
| Basic messaging | ✅ | ✅ | Low |
| Order placement | ✅ | ✅ (enhanced) | Medium |
| Product catalog | ✅ | ✅ | Low |
| Invoice generation | ❌ | ✅ | High |
| Reminders | ❌ | ✅ | High |
| Campaigns | ❌ | ✅ | High |
| Rate limiting | Basic | Advanced | Medium |
| Error handling | Basic | Comprehensive | Medium |
| Circuit breaker | ❌ | ✅ | High |
| Middleware pipeline | ❌ | ✅ | Medium |

## 🔧 Configuration Changes

### **Environment Variables**

Add to `.env`:

```env
# Feature flags
USE_NEW_WHATSAPP_BOT=true
ENABLE_CAMPAIGNS=true
ENABLE_REMINDERS=true

# New system configuration
WHATSAPP_V2_WEBHOOK_PATH=/whatsapp-v2/webhook
```

### **Queue Configuration**

The new system adds these queues:

```typescript
BullModule.registerQueue(
  { name: 'order-processing' },    // NEW
  { name: 'invoice-processing' },  // NEW
  { name: 'reminders' },           // NEW
  { name: 'campaigns' }            // NEW
)
```

Ensure Redis can handle additional connections.

## 🐛 Troubleshooting Migration

### **Issue: Duplicate messages**

**Cause:** Both systems processing same webhook

**Solution:**
```typescript
// Add deduplication
const messageId = payload.MessageSid;
const isDuplicate = await redis.get(`processed:${messageId}`);

if (isDuplicate) {
  return 'OK'; // Already processed
}

await redis.setex(`processed:${messageId}`, 300, 'true'); // 5 min TTL
```

### **Issue: Redis connection errors**

**Cause:** Too many connections

**Solution:**
```typescript
// Increase Redis max connections
// redis.conf
maxclients 10000

// Or use connection pooling
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});
```

### **Issue: Queue jobs not processing**

**Cause:** Workers not registered

**Solution:**
```typescript
// Verify workers are in module providers
@Module({
  providers: [
    OrderProcessingWorker,
    InvoiceWorker,
    ReminderWorker,
    CampaignWorker,
  ],
})
export class WhatsAppBotModule {}
```

## 📊 Monitoring During Migration

### **Key Metrics to Track**

1. **Message Processing**
   - Old system: Throughput, latency, errors
   - New system: Throughput, latency, errors
   - Compare side-by-side

2. **Error Rates**
   - Track error types
   - Compare error rates
   - Alert on spikes

3. **Queue Health**
   - Waiting jobs
   - Active jobs
   - Failed jobs
   - Processing time

4. **User Experience**
   - Response times
   - Success rates
   - Customer feedback

### **Monitoring Dashboard**

```typescript
@Get('/monitoring')
async getMonitoringStats() {
  // Old system stats
  const oldStats = await this.oldSystemService.getStats();

  // New system stats
  const newStats = {
    messages: await this.messageHandler.getStats(),
    orders: await this.orderService.getStats(),
    invoices: await this.invoiceService.getStats(),
    reminders: await this.reminderService.getStats(),
    campaigns: await this.campaignService.getStats(),
  };

  // Queue stats
  const queueStats = {
    orderProcessing: await this.orderQueue.getJobCounts(),
    invoices: await this.invoiceQueue.getJobCounts(),
    reminders: await this.reminderQueue.getJobCounts(),
    campaigns: await this.campaignQueue.getJobCounts(),
  };

  return {
    old: oldStats,
    new: newStats,
    queues: queueStats,
    timestamp: new Date(),
  };
}
```

## ✅ Migration Checklist

### **Pre-Migration**
- [ ] Review new architecture documentation
- [ ] Set up monitoring
- [ ] Configure environment variables
- [ ] Test new features in development
- [ ] Create rollback plan

### **Migration**
- [ ] Update app.module.ts
- [ ] Configure dual webhooks
- [ ] Deploy to staging
- [ ] Test all flows end-to-end
- [ ] Start with 10% traffic
- [ ] Monitor for 1 week
- [ ] Increase to 50% traffic
- [ ] Monitor for 1 week
- [ ] Route 100% traffic

### **Post-Migration**
- [ ] Verify all features working
- [ ] Check queue health
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Remove old code (after 2 weeks)
- [ ] Update documentation

## 🚀 Quick Start (Skip Migration)

If you want to use only the new system:

### **1. Remove old module**

```typescript
// app.module.ts
@Module({
  imports: [
    // Remove: WhatsAppModule,
    WhatsAppBotModule, // Keep only this
  ],
})
export class AppModule {}
```

### **2. Update webhook URL**

Point Twilio to: `https://your-domain.com/whatsapp/webhook`

### **3. Delete old files (optional)**

```bash
# Backup first!
mkdir old-whatsapp-backup
cp -r src/integrations/whatsapp old-whatsapp-backup/

# Remove old files (keep services that new system uses)
rm src/integrations/whatsapp/whatsapp.module.ts
rm src/integrations/whatsapp/controllers/whatsapp.controller.ts
# Keep: conversation-handler, product-matcher, etc.
```

## 📞 Support During Migration

### **Common Issues**

1. **"Module not found" errors**
   - Run `npm install`
   - Run `npm run prisma:generate`
   - Restart dev server

2. **Redis connection errors**
   - Verify Redis is running: `redis-cli ping`
   - Check REDIS_HOST and REDIS_PORT

3. **Queue jobs not running**
   - Verify BullMQ is configured
   - Check Redis connectivity
   - Review worker logs

### **Getting Help**

1. Check logs: `tail -f logs/whatsapp-bot.log`
2. Review documentation
3. Test with small traffic first
4. Keep old system as backup

## 🎓 Best Practices

1. **Test Thoroughly**
   - Test all conversation flows
   - Test error scenarios
   - Load test with expected traffic

2. **Monitor Closely**
   - Set up alerts for errors
   - Track key metrics
   - Review logs daily during migration

3. **Have Rollback Plan**
   - Keep old system running
   - Document rollback steps
   - Practice rollback in staging

4. **Communicate Changes**
   - Inform team about migration
   - Document new features
   - Train support staff

## 📝 Summary

The migration can be done gradually and safely. The new system coexists with the old one, allowing you to:

✅ Test new features without risk
✅ Migrate customers gradually
✅ Monitor both systems
✅ Roll back if needed
✅ Keep zero downtime

Start with **Option 1 (parallel systems)** and migrate over 4-6 weeks for safest approach.

---

**Need help? Review the detailed architecture and usage docs:**
- WHATSAPP_BOT_ARCHITECTURE.md
- WHATSAPP_BOT_GUIDE.md
- WHATSAPP_BOT_SUMMARY.md
