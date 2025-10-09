# Test Command - No Real WhatsApp Messages

## Quick Test (Won't Send Actual WhatsApp)

```bash
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{
    "distributorPhoneNumber": "+14155238886",
    "userPhoneNumber": "+19876543210",
    "message": "shirt x 1"
  }'
```

**Important:**
- `distributorPhoneNumber` = Your Twilio number (+14155238886)
- `userPhoneNumber` = Customer's number (use ANY different number for testing like +19876543210)
- This endpoint **DOES NOT** send actual WhatsApp messages
- It only tests the conversation logic and returns the response

## Expected Response

```json
{
  "success": true,
  "data": {
    "message": "📋 *Order Summary*\n\nshirt x 1 - ₹200\n\n💰 Total: ₹200\n\n✅ Please confirm:\n1️⃣ Yes, place this order\n2️⃣ No, let me modify\n\nReply with 1 or 2"
  },
  "input": {
    "distributorPhoneNumber": "+14155238886",
    "userPhoneNumber": "+19876543210",
    "message": "shirt x 1"
  }
}
```

## Test Full Flow

```bash
# Step 1: Greeting
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"+14155238886","userPhoneNumber":"+19876543210","message":"hi"}'

# Step 2: Order
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"+14155238886","userPhoneNumber":"+19876543210","message":"shirt x 1"}'

# Step 3: Confirm
curl -X POST http://localhost:3000/whatsapp/test/message \
  -H "Content-Type: application/json" \
  -d '{"distributorPhoneNumber":"+14155238886","userPhoneNumber":"+19876543210","message":"1"}'
```

## Why Your Test Failed

Your error:
```
From: whatsapp:+14155238886 To: whatsapp:+14155238886
Error: Message cannot have the same To and From
```

This happened because you were using:
- ❌ Webhook endpoint `/whatsapp/webhook` (tries to send real WhatsApp)
- ❌ Same phone number for both customer and distributor

**Solution:**
- ✅ Use test endpoint `/whatsapp/test/message` (no real WhatsApp)
- ✅ Use different phone numbers

## Real WhatsApp Testing

If you want to test with **real WhatsApp messages**:

1. Customer must have a real WhatsApp account
2. Customer sends message to your Twilio WhatsApp number: +14155238886
3. Twilio forwards to your webhook
4. Your server responds back to customer

**You cannot test real WhatsApp from Postman/curl** - the customer must actually send a WhatsApp message!
