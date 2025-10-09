# WhatsApp Bot - Quick Start Guide

## 🚀 Features

This enterprise-grade WhatsApp bot provides:

✅ **Order Management** - Customers can place orders via WhatsApp
✅ **Automated Invoicing** - Auto-generate and send invoices
✅ **Smart Reminders** - Payment due, abandoned cart, restock alerts
✅ **Marketing Campaigns** - Broadcast messages with targeting
✅ **Product Catalog** - Browse and search products
✅ **Rate Limiting** - Protection against spam
✅ **Circuit Breaker** - Resilient external API calls
✅ **Session Management** - Persistent conversation state

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- Twilio account with WhatsApp enabled

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/biznavigate"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Twilio WhatsApp
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
WHATSAPP_VERIFY_TOKEN=your_secure_token

# Zoho (if using)
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_secret
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Start Services

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📱 Customer Flows

### Flow 1: Placing an Order

**Customer Conversation:**
```
Customer: Hi
Bot: Welcome! Ready to take your order!
     Please send me your product list...

Customer: Cement x 100
          Steel rod x 50

Bot: 📋 Order Summary
     • Cement x 100 - ₹5,000
     • Steel rod x 50 - ₹2,500

     Total: ₹7,500

     ✅ Please confirm:
     1️⃣ Yes, place this order
     2️⃣ No, let me modify

Customer: 1

Bot: 🎉 Order Confirmed!
     Order ID: ORD-12345

     📧 Invoice INV-67890 has been sent
     💰 Total: ₹7,500

     Thank you for your business!
```

### Flow 2: Browsing Catalog

**Customer Conversation:**
```
Customer: catalog

Bot: 🛒 Product Catalog

     1. Portland Cement - ₹350/bag
        Stock: 500 bags available

     2. TMT Steel Bars - ₹45/kg
        Stock: 2000 kg available

     [Page 1 of 5]

     Type 'next' for more products
     Type 'search [product]' to search

Customer: search cement

Bot: 🔍 Search Results for "cement"

     1. Portland Cement - ₹350/bag
     2. White Cement - ₹450/bag
     3. Quick Set Cement - ₹400/bag

     To order, type: "Product name x Quantity"
```

### Flow 3: Receiving Reminders

**Automated Reminder:**
```
Bot: 💰 Payment Reminder

     You have a payment of ₹7,500 due on Jan 15, 2025.

     Invoice: INV-67890

     Please make the payment to avoid late fees.

     Reply 'pay' to get payment details.
```

## 🔧 Admin Operations

### Create a Campaign

```bash
curl -X POST http://localhost:3000/whatsapp/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "name": "New Year Sale",
    "message": "🎉 Happy New Year {{name}}!\n\nGet 20% off on all products today!",
    "type": "PROMOTIONAL",
    "targetAudience": {
      "type": "all"
    },
    "startImmediately": true
  }'
```

### Schedule a Reminder

```bash
curl -X POST http://localhost:3000/whatsapp/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "customerId": "cust-456",
    "customerPhone": "+1234567890",
    "type": "PAYMENT_DUE",
    "message": "Payment reminder for Invoice #123",
    "scheduledFor": "2025-01-15T10:00:00Z"
  }'
```

### Get Order Details

```bash
curl http://localhost:3000/whatsapp/orders/order-id-123
```

### Get Campaign Metrics

```bash
curl http://localhost:3000/whatsapp/campaigns/campaign-id-456/metrics
```

Response:
```json
{
  "id": "campaign-id-456",
  "name": "New Year Sale",
  "status": "completed",
  "totalRecipients": 1000,
  "sentCount": 1000,
  "deliveredCount": 985,
  "failedCount": 15,
  "responseCount": 120,
  "deliveryRate": 98.5,
  "responseRate": 12.18
}
```

## 🎯 Advanced Usage

### Programmatic Order Creation

```typescript
import { OrderService } from '@/integrations/whatsapp/features/orders/application/services/order.service';
import { CreateOrderCommand } from '@/integrations/whatsapp/features/orders/application/commands/create-order.command';

// Inject OrderService
constructor(private orderService: OrderService) {}

// Create order
const command = new CreateOrderCommand(
  'org-123',           // organizationId
  'cust-456',          // customerId
  '+1234567890',       // customerPhone
  [                    // items
    {
      productId: 'prod-1',
      productName: 'Cement',
      quantity: 100,
      price: 350,
      taxRate: 18,
    }
  ],
  'Urgent delivery'    // notes
);

const result = await this.orderService.createOrder(command);
```

### Programmatic Campaign

```typescript
import { CampaignService } from '@/integrations/whatsapp/features/campaigns/application/services/campaign.service';

const campaign = await campaignService.createCampaign({
  organizationId: 'org-123',
  name: 'Flash Sale',
  message: 'Limited time offer! {{name}}, get 50% off today only!',
  type: CampaignType.PROMOTIONAL,
  targetAudience: {
    type: 'segment',
    filters: {
      lastOrderDate: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31')
      },
      totalSpent: {
        min: 5000
      }
    }
  }
});

await campaignService.startCampaign(campaign.id);
```

### Programmatic Reminder

```typescript
import { ReminderService } from '@/integrations/whatsapp/features/reminders/application/services/reminder.service';

// Payment reminder
await reminderService.schedulePaymentReminder({
  organizationId: 'org-123',
  customerId: 'cust-456',
  customerPhone: '+1234567890',
  invoiceId: 'inv-789',
  dueDate: new Date('2025-01-15'),
  amount: 7500
});

// Abandoned cart reminder
await reminderService.scheduleAbandonedCartReminder({
  organizationId: 'org-123',
  customerId: 'cust-456',
  customerPhone: '+1234567890',
  cartId: 'cart-123',
  itemCount: 3
});
```

## 🛠️ Customization

### Adding Custom Middleware

```typescript
import { Injectable } from '@nestjs/common';
import { MessageMiddleware } from '@/integrations/whatsapp/core/middleware/message-middleware.interface';
import { MessageContext } from '@/integrations/whatsapp/core/message-context';

@Injectable()
export class CustomMiddleware implements MessageMiddleware {
  async process(context: MessageContext, next: () => Promise<void>): Promise<void> {
    // Your logic here
    console.log('Processing message:', context.body);

    // Call next middleware
    await next();
  }
}

// Register in controller onModuleInit
this.pipeline.use(this.customMiddleware, 500);
```

### Extending Order Entity

```typescript
// Add new business logic to Order entity
class Order {
  // Existing code...

  applyDiscount(percentage: number): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error('Can only apply discount to draft orders');
    }

    const discountAmount = this._totalAmount * (percentage / 100);
    this._totalAmount -= discountAmount;
    this._updatedAt = new Date();
  }
}
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/whatsapp/health
```

### View Logs

```bash
# Follow logs
tail -f logs/whatsapp-bot.log

# Filter errors
grep ERROR logs/whatsapp-bot.log
```

### Queue Monitoring

Use BullMQ dashboard or:

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectQueue('order-processing') private orderQueue: Queue
  ) {}

  async getQueueStats() {
    const waiting = await this.orderQueue.getWaitingCount();
    const active = await this.orderQueue.getActiveCount();
    const completed = await this.orderQueue.getCompletedCount();
    const failed = await this.orderQueue.getFailedCount();

    return { waiting, active, completed, failed };
  }
}
```

## 🔒 Security Best Practices

1. **Webhook Verification**
   - Always verify Twilio signatures
   - Use strong WHATSAPP_VERIFY_TOKEN

2. **Rate Limiting**
   - Adjust limits based on usage patterns
   - Monitor for abuse

3. **Input Validation**
   - Sanitize all user inputs
   - Validate product IDs before database queries

4. **Environment Variables**
   - Never commit .env to git
   - Use secrets management in production

## 🐛 Troubleshooting

### Messages Not Processing

```bash
# Check webhook configuration
# Ensure Twilio webhook points to: https://your-domain.com/whatsapp/webhook

# Verify environment variables
echo $TWILIO_SID
echo $TWILIO_AUTH_TOKEN

# Check logs
tail -f logs/error.log
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check configuration
echo $REDIS_HOST
echo $REDIS_PORT
```

### Queue Jobs Stuck

```bash
# Clear failed jobs
npm run bullmq:clean

# Or programmatically:
const failed = await queue.getFailed();
await Promise.all(failed.map(job => job.remove()));
```

## 📚 Additional Resources

- [Full Architecture Documentation](./WHATSAPP_BOT_ARCHITECTURE.md)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [NestJS Documentation](https://docs.nestjs.com/)

## 🤝 Support

For issues or questions:
1. Check logs for error details
2. Review architecture documentation
3. Verify environment configuration
4. Test with webhook debugging tools

## 📝 License

Proprietary - All rights reserved
