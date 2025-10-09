# Intent Detection Test Scenarios

## Scenario 1: User sends "shirt x 1" after "Ready to take your order"

### Expected Flow:
1. **Step**: `PLACE_ORDER_REQUEST`
2. **Input**: "shirt x 1"
3. **AI Intent Detection**:
   - Intent: `PLACE_ORDER`
   - Confidence: ~0.95
   - Extracted: `{ productName: "shirt", quantity: 1 }`
4. **Rule-based Fallback Check**:
   - `isProductListFormat("shirt x 1")` → `true` (matches regex `/^(.+?)\s*x\s*(\d+)$/i`)
5. **Event**: `ORDER_PLACED`
6. **Next Step**: `AWAITING_PRODUCT_LIST`
7. **Response**: Product matching and order confirmation

### Debug Logs to Look For:
```
[AI INTENT] Detected: place_order (confidence: 0.95)
[AI INTENT] Reasoning: User specified product with quantity
[DEBUG] AI detected ORDER intent with high confidence - treating as ORDER_PLACED
```

OR (if AI confidence is lower):
```
[AI INTENT] Detected: place_order (confidence: 0.6)
[DEBUG] Using rule-based detection as fallback
[DEBUG] Detected product list format - treating as ORDER_PLACED
```

---

## Scenario 2: User sends "shirt" (no quantity)

### Expected Flow:
1. **Step**: `PLACE_ORDER_REQUEST`
2. **Input**: "shirt"
3. **AI Intent Detection**:
   - Intent: `SEARCH_PRODUCT`
   - Confidence: ~0.90
   - Extracted: `{ productName: "shirt" }`
4. **Event**: `null` (stay in current step)
5. **Next Step**: `PLACE_ORDER_REQUEST` (same)
6. **Response**:
   ```
   I see you're looking for "shirt".

   🔍 To search: Type 'search shirt'
   🛒 To order: Send with quantity like "shirt x 100"
   ```

### Debug Logs:
```
[AI INTENT] Detected: search_product (confidence: 0.90)
[AI INTENT] Reasoning: User mentioned product name without quantity
[DEBUG] AI detected SEARCH intent with high confidence - staying in PLACE_ORDER_REQUEST
```

---

## Scenario 3: User sends "100 shirts"

### Expected Flow:
1. **Step**: `PLACE_ORDER_REQUEST`
2. **Input**: "100 shirts"
3. **AI Intent Detection**:
   - Intent: `PLACE_ORDER`
   - Confidence: ~0.90
   - Extracted: `{ productName: "shirts", quantity: 100 }`
4. **Rule-based Check**:
   - Has quantity: `true`
   - Is likely product: `true`
5. **Event**: `ORDER_PLACED`
6. **Next Step**: `AWAITING_PRODUCT_LIST`

---

## Scenario 4: AI is unavailable (no GEMINI_API_KEY)

### Expected Flow:
1. **Step**: `PLACE_ORDER_REQUEST`
2. **Input**: "shirt x 1"
3. **AI Detection**: Falls back to rule-based
4. **Rule-based Detection**:
   - Intent: `PLACE_ORDER` (from rule-based)
   - Confidence: 0.95
5. **Event**: `ORDER_PLACED`
6. **Works perfectly without AI**

---

## Testing Commands

### Manual Testing via WhatsApp:
1. Send "hi" to start
2. Wait for "Ready to take your order!" message
3. Send "shirt x 1"
4. **Expected**: Should show product matching and order summary
5. **NOT Expected**: Should NOT show "Ready to take your order!" again

### Check Logs:
```bash
# Look for these patterns in logs
grep "AI INTENT" logs/app.log
grep "Detected product list format" logs/app.log
grep "ORDER_PLACED" logs/app.log
```

### Verify State Transitions:
```bash
# Check Redis session data
redis-cli
> KEYS whatsapp:session:*
> GET whatsapp:session:[phone_number]
# Look for currentStep changing from PLACE_ORDER_REQUEST to AWAITING_PRODUCT_LIST
```

---

## Common Issues and Solutions

### Issue: "shirt x 1" not being detected
**Solution**: Check these in order:
1. Verify `isProductListFormat()` regex is working
2. Check AI confidence threshold (should be > 0.7)
3. Ensure rule-based fallback is executing
4. Look for TypeScript compilation errors

### Issue: Still showing "Ready to take your order!" twice
**Solution**:
1. Check that `parseUserInput` is returning `ORDER_PLACED` event
2. Verify state machine transition is configured
3. Check guard conditions in state machine
4. Ensure `updateContextForEvent` is processing the order

### Issue: AI always returning low confidence
**Solution**:
1. Check GEMINI_API_KEY is configured
2. Verify internet connectivity
3. Check Redis cache (might be caching old results)
4. Clear cache: `redis-cli FLUSHDB`

---

## Success Criteria

✅ "shirt x 1" → Proceeds to order placement
✅ "shirt" → Shows search suggestion
✅ "100 shirts" → Proceeds to order placement
✅ "cement x 50" → Proceeds to order placement
✅ "cement" → Shows search suggestion
✅ Works with or without GEMINI_API_KEY
✅ AI intent logged with confidence and reasoning
✅ Rule-based fallback always works
