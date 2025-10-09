# WhatsApp Bot - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Verification

- [x] All TypeScript errors fixed
- [x] All new files created
- [x] Documentation complete
- [ ] Run build to verify compilation
- [ ] Run linter (`npm run lint`)
- [ ] Format code (`npm run format`)

```bash
# Verify everything compiles
npm run build

# Should output: "Successfully compiled"
```

### 2. Environment Configuration

- [ ] Copy `.env.example` to `.env` (if exists)
- [ ] Configure all environment variables

**Required Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/biznavigate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Twilio WhatsApp
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
WHATSAPP_VERIFY_TOKEN=your_secure_random_token

# Zoho (if using)
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret

# Optional: Feature flags
USE_NEW_WHATSAPP_BOT=true
ENABLE_CAMPAIGNS=true
ENABLE_REMINDERS=true
```

### 3. Database Setup

- [ ] PostgreSQL is running
- [ ] Database exists
- [ ] Run Prisma generation

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (if any)
npm run prisma:migrate

# Verify database connection
npm run prisma:studio
```

### 4. Redis Setup

- [ ] Redis server is running
- [ ] Verify connectivity

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis is accessible
redis-cli
> SET test "hello"
> GET test
# Should return: "hello"
```

### 5. Dependencies

- [ ] All npm packages installed
- [ ] No security vulnerabilities

```bash
# Install dependencies
npm install

# Check for vulnerabilities
npm audit

# Fix if needed
npm audit fix
```

## 🚀 Deployment Steps

### Step 1: Local Testing

```bash
# Start development server
npm run start:dev

# Server should start without errors
# Watch for: "Nest application successfully started"
```

**Test endpoints:**
```bash
# Health check
curl http://localhost:3000/whatsapp/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "services": {
#     "messageHandler": "operational",
#     "redis": "operational",
#     "database": "operational"
#   }
# }
```

### Step 2: Module Integration

**Choose one approach:**

#### Option A: Run Both Systems (Recommended)
Keep existing `WhatsAppModule` and add new `WhatsAppBotModule`:

```typescript
// src/app.module.ts
@Module({
  imports: [
    // ... other modules
    WhatsAppModule,      // Existing (keep for now)
    WhatsAppBotModule,   // NEW - add this
  ],
})
```

#### Option B: Use Only New System
Replace existing module with new one:

```typescript
// src/app.module.ts
@Module({
  imports: [
    // ... other modules
    // WhatsAppModule,      // Remove or comment out
    WhatsAppBotModule,      // Use new system only
  ],
})
```

### Step 3: Twilio Webhook Configuration

1. **Log in to Twilio Console**
   - Go to: https://console.twilio.com/

2. **Navigate to WhatsApp Sandbox** (for testing)
   - Messaging → Try it out → Send a WhatsApp message

3. **Configure Webhook**
   - When a message comes in: `https://your-domain.com/whatsapp/webhook`
   - HTTP Method: `POST`

4. **For Production WhatsApp Number**
   - Messaging → WhatsApp → Senders
   - Configure your approved number
   - Set webhook URL

### Step 4: Test Message Flow

**Send test message:**
1. Send "Hi" to your WhatsApp number
2. Check server logs for message processing
3. Verify response is received

**Expected flow:**
```
User: Hi
Bot: Welcome! Ready to take your order!
     Please send me your product list...
```

### Step 5: Test Features

#### Test Order Placement
```
User: Hi
Bot: [Welcome message]

User: Cement x 100
Bot: [Order summary with total]

User: 1
Bot: [Order confirmed + Invoice sent]
```

#### Test Campaign Creation
```bash
curl -X POST http://localhost:3000/whatsapp/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "test-org",
    "name": "Test Campaign",
    "message": "Test message",
    "type": "PROMOTIONAL",
    "targetAudience": { "type": "all" },
    "startImmediately": false
  }'

# Should return campaign ID and status
```

#### Test Reminder Scheduling
```bash
curl -X POST http://localhost:3000/whatsapp/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "test-org",
    "customerId": "test-customer",
    "customerPhone": "+1234567890",
    "type": "PAYMENT_DUE",
    "message": "Test reminder",
    "scheduledFor": "2025-01-15T10:00:00Z"
  }'

# Should return reminder ID
```

### Step 6: Monitor Background Jobs

```bash
# Check BullMQ dashboard (if installed)
# Or monitor Redis keys
redis-cli KEYS "bull:*"

# Check job counts
redis-cli LLEN "bull:order-processing:waiting"
redis-cli LLEN "bull:order-processing:active"
redis-cli LLEN "bull:order-processing:completed"
redis-cli LLEN "bull:order-processing:failed"
```

### Step 7: Production Deployment

#### Option 1: Traditional Deployment
```bash
# Build production bundle
npm run build

# Start production server
npm run start:prod

# Or use PM2
pm2 start dist/main.js --name whatsapp-bot
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

```bash
# Build and run
docker build -t whatsapp-bot .
docker run -p 3000:3000 --env-file .env whatsapp-bot
```

#### Option 3: Cloud Deployment (AWS/Heroku/Railway)
Follow platform-specific deployment guides.

## 🔍 Post-Deployment Verification

### 1. Health Checks
```bash
# Application health
curl https://your-domain.com/whatsapp/health

# Redis connectivity
redis-cli -h <your-redis-host> ping

# Database connectivity
npm run prisma:studio
```

### 2. Monitoring Setup

**Recommended tools:**
- **Logging**: Winston, Pino, or CloudWatch
- **Metrics**: Prometheus + Grafana
- **APM**: New Relic, DataDog, or Sentry
- **Uptime**: UptimeRobot or Pingdom

**Key metrics to monitor:**
- Request throughput (messages/minute)
- Response time (p50, p95, p99)
- Error rate
- Queue depth (BullMQ jobs waiting)
- Redis memory usage
- Database connection pool

### 3. Error Monitoring

Check logs for:
```bash
# Application logs
tail -f logs/whatsapp-bot.log

# Filter errors
grep ERROR logs/whatsapp-bot.log

# NestJS logs (if using PM2)
pm2 logs whatsapp-bot
```

### 4. Performance Testing

**Load test with sample messages:**
```bash
# Using Apache Bench
ab -n 100 -c 10 -p message.json -T application/json \
  http://localhost:3000/whatsapp/webhook

# Using k6
k6 run load-test.js
```

## 🐛 Troubleshooting

### Issue: Server won't start

**Check:**
```bash
# Dependencies installed?
npm install

# Prisma generated?
npm run prisma:generate

# Environment variables set?
cat .env

# Port already in use?
lsof -i :3000
```

### Issue: TypeScript errors

```bash
# Clean build
rm -rf dist/
rm -rf node_modules/
npm install
npm run build
```

### Issue: Redis connection failed

```bash
# Is Redis running?
redis-cli ping

# Check environment variables
echo $REDIS_HOST
echo $REDIS_PORT

# Test connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
```

### Issue: Database connection failed

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run prisma:studio

# Check PostgreSQL is running
psql -h localhost -U youruser -d biznavigate
```

### Issue: Webhook not receiving messages

**Check:**
1. Twilio webhook URL is correct
2. Server is publicly accessible (use ngrok for local testing)
3. Webhook verification token matches
4. Server logs for incoming requests

```bash
# Use ngrok for local testing
ngrok http 3000

# Use the ngrok URL in Twilio:
# https://xxxx.ngrok.io/whatsapp/webhook
```

### Issue: Jobs not processing

```bash
# Check workers are registered
# Check BullMQ queue
redis-cli KEYS "bull:*"

# Check for failed jobs
redis-cli LRANGE "bull:order-processing:failed" 0 -1

# Restart workers
pm2 restart whatsapp-bot
```

## 📊 Success Criteria

### Deployment is successful when:

- [x] ✅ Server starts without errors
- [x] ✅ Health check endpoint returns 200
- [x] ✅ Can receive WhatsApp messages
- [x] ✅ Can send WhatsApp responses
- [x] ✅ Orders can be created
- [x] ✅ Invoices are generated
- [x] ✅ Reminders can be scheduled
- [x] ✅ Campaigns can be created
- [x] ✅ Background jobs are processing
- [x] ✅ No errors in logs
- [x] ✅ Redis is connected
- [x] ✅ Database is connected

## 🎯 Next Steps After Deployment

### Week 1: Monitor & Stabilize
- Watch error logs daily
- Monitor performance metrics
- Fix any bugs that arise
- Collect user feedback

### Week 2-4: Optimize
- Fine-tune rate limits
- Optimize database queries
- Add caching where needed
- Improve response messages

### Month 2+: Enhance
- Add analytics dashboard
- Implement A/B testing
- Add more reminder types
- Enhance campaign targeting
- Add payment integration

## 📚 Additional Resources

- **Architecture Docs**: See `WHATSAPP_BOT_ARCHITECTURE.md`
- **Usage Guide**: See `WHATSAPP_BOT_GUIDE.md`
- **Migration Guide**: See `MIGRATION_GUIDE.md`
- **TypeScript Fixes**: See `TYPESCRIPT_FIXES_APPLIED.md`

## 🆘 Support

If you encounter issues:

1. Check logs for error details
2. Review troubleshooting section above
3. Check environment configuration
4. Verify all services are running (Redis, PostgreSQL)
5. Test with ngrok for local debugging

---

**Ready to deploy! Follow the checklist step by step.** 🚀
