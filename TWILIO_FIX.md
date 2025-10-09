# Twilio WhatsApp Error Fix

## Error: "Twilio could not find a Channel with the specified From address"

### Root Cause
The `sendMessage` function was using the wrong "from" number. It needs to use your **configured Twilio WhatsApp number**, not the number from the webhook payload.

### Fix Applied

Updated `src/integrations/whatsapp/services/whatsapp.service.ts` to:
1. Read `TWILIO_PHONE_NUMBER` from config
2. Use that as the "from" number for all outgoing messages
3. Ignore the `from` parameter (kept for backward compatibility)

### Configuration Required

**Add to your `.env` file:**

```env
# For Twilio Sandbox (testing)
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# OR for Production (approved number)
TWILIO_PHONE_NUMBER=whatsapp:+1234567890
```

### How to Find Your Twilio WhatsApp Number

#### For Sandbox (Development):
1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. The number is: `whatsapp:+14155238886` (standard Twilio sandbox)

#### For Production:
1. Go to: https://console.twilio.com/us1/develop/sms/senders
2. Find your approved WhatsApp sender
3. Copy the number (e.g., `+1234567890`)
4. Add `whatsapp:` prefix → `whatsapp:+1234567890`

### Verify Configuration

```bash
# Check your .env file
cat .env | grep TWILIO_PHONE_NUMBER

# Should output something like:
# TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

### Test the Fix

1. **Restart your server:**
   ```bash
   npm run start:dev
   ```

2. **Send a WhatsApp message** to your bot (e.g., "Hi")

3. **Check logs:**
   ```
   Formatted phone numbers - From: whatsapp:+14155238886, To: whatsapp:+1234567890
   WhatsApp message sent successfully
   ```

4. **You should receive a response** without the Twilio error

### Common Issues

#### Issue: Still getting error after adding env variable

**Solution:**
```bash
# Restart server to reload environment variables
npm run start:dev
```

#### Issue: Undefined or null TWILIO_PHONE_NUMBER

**Check:**
1. Variable is in `.env` file
2. No typos in variable name
3. Server was restarted after adding it

**Debug:**
```typescript
// Add temporary log in whatsapp.service.ts
const twilioWhatsAppNumber = this.configService.get<string>("TWILIO.PHONE_NUMBER");
console.log("DEBUG: Twilio WhatsApp Number:", twilioWhatsAppNumber);
```

#### Issue: Using production number but still fails

**Verify the number:**
1. Number is approved in Twilio console
2. Number has WhatsApp enabled
3. Format is correct: `whatsapp:+1234567890`

### What Changed

**Before:**
```typescript
// Used 'from' parameter from webhook (WRONG)
const formattedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
```

**After:**
```typescript
// Use configured Twilio WhatsApp number (CORRECT)
const twilioWhatsAppNumber = this.configService.get<string>("TWILIO.PHONE_NUMBER");
const formattedFrom = twilioWhatsAppNumber?.startsWith('whatsapp:')
  ? twilioWhatsAppNumber
  : `whatsapp:${twilioWhatsAppNumber}`;
```

### Alternative: Hardcode for Quick Test

If you want to test quickly without environment variables:

```typescript
// In whatsapp.service.ts, line 170
const twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Hardcode for testing
```

**⚠️ Warning:** Remove hardcoded value before production!

### Complete .env Example

```env
# Twilio
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/biznavigate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Verify It Works

**Test flow:**
```
1. Send: "Hi"
   Expected: Welcome message received ✅

2. Send: "Shirt x 100"
   Expected: Order summary with total ✅

3. Send: "1" (confirm)
   Expected: Order confirmed, invoice sent ✅
```

### Debug Logs

If still having issues, check these logs:

```
Sending WhatsApp message to whatsapp:+1234567890: [message]...
Sending message with data: [contentVariables]
Formatted phone numbers - From: whatsapp:+14155238886, To: whatsapp:+1234567890
WhatsApp message sent successfully
```

**If you see:**
- ❌ `From: whatsapp:undefined` → Environment variable not set
- ❌ `From: whatsapp:+1234567890` (customer number) → Old code still running, restart server
- ✅ `From: whatsapp:+14155238886` (Twilio number) → Correct!

---

## Summary

✅ **Fixed**: `sendMessage` now uses `TWILIO_PHONE_NUMBER` from config
✅ **Required**: Add `TWILIO_PHONE_NUMBER` to `.env`
✅ **Default**: Use `whatsapp:+14155238886` for Twilio Sandbox
✅ **Test**: Restart server and send a message

**The error should be resolved!** 🎉
