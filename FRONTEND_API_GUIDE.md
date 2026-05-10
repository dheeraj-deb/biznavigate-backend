# BizNavigate Backend — Frontend Integration Guide

## Base URL
```
http://localhost:3000          (local dev)
https://your-api.domain.com    (production)
```

---

## Authentication

Every protected endpoint requires a Bearer token in the header:
```
Authorization: Bearer <access_token>
```

### Auth flow
```
POST /auth/signup     → create account (public)
POST /auth/login      → returns { access_token, refresh_token, user }
POST /auth/refresh    → Body: { refresh_token } → returns new { access_token }
POST /auth/logout     → (protected) revokes refresh token
```

### Token shape (decoded)
```json
{
  "user_id": "uuid",
  "business_id": "uuid",
  "tenant_id": "uuid",
  "role_id": "uuid",
  "email": "string"
}
```
Store `access_token` in memory, `refresh_token` in httpOnly cookie or localStorage. Auto-refresh when you get a 401.

---

## Standard Response Format

**Success (single item)**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Success (list with pagination)**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

**Error**
```json
{ "statusCode": 400, "message": "Validation failed", "error": "Bad Request" }
```

**SubscriptionGuard block (subscription required)**
```json
{ "statusCode": 403, "message": "No active subscription" }
```

---

## Rate Limits

| Window | Limit |
|--------|-------|
| Per second | 10 requests |
| Per minute | 100 requests |
| Per 15 minutes | 1,000 requests |

Returns `429 Too Many Requests` when exceeded.

---

## Guards on Routes

- `PUBLIC` — No auth needed
- `JWT` — Requires `Authorization: Bearer <token>`
- `JWT + SUB` — Requires JWT **and** an active paid subscription
- `HMAC` — Webhook-only, verified by provider signature

---

## ❌ Backend APIs That Are NOT Implemented (return 501)

Do NOT build UI for these yet — they throw `NotImplementedException`:

| Route | Status |
|-------|--------|
| ALL `/reviews/*` | 501 — superseded by CatalogModule, not yet rebuilt |
| `POST /instagram/catalog/:businessId/toggle` | 501 |
| `POST /instagram/catalog/:businessId/bulk-toggle` | 501 |
| `POST /instagram/catalog/:businessId/sync` | 501 |
| `GET /instagram/catalog/:businessId/batch-status` | 501 |

---

## ✅ All Available APIs

---

### AUTH

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /auth/signup | PUBLIC | `{ name, email, password, phone_number, business_name, business_type? }` |
| POST | /auth/login | PUBLIC | `{ email, password }` → access_token + refresh_token |
| POST | /auth/refresh | PUBLIC | `{ refresh_token }` → new access_token |
| POST | /auth/logout | JWT | Revokes session |

---

### USERS

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /users | JWT | List users. Paginated. `?page=1&limit=20` |
| GET | /users/profile | JWT | Current user profile |
| GET | /users/:user_id | JWT | Get user by ID |
| POST | /users/create | JWT | Create new staff user |
| PATCH | /users/profile | JWT | Update own profile |
| PATCH | /users/update/:user_id | JWT | Update any user (admin) |
| PATCH | /users/assign-role | JWT | `{ user_id, role_id }` |

---

### BUSINESS & TENANT

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /businesses | JWT | List all businesses |
| GET | /businesses/:id | JWT | Get business by ID |
| POST | /businesses | JWT | Create business |
| PATCH | /businesses/:id | JWT | Update business |
| DELETE | /businesses/:id | JWT | Soft-delete business |
| POST | /onboarding/complete | JWT | Complete onboarding wizard |
| GET | /tenants | JWT | List tenants (paginated) |
| GET | /tenants/:id | JWT | Get tenant |
| PATCH | /tenants/:id | JWT | Update tenant |

---

### BUSINESS SETTINGS ⭐ NEW

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /business-settings | JWT | Get timezone, language, onboarding step, AI toggle, etc. |
| PATCH | /business-settings | JWT | Update any setting. Body: `{ timezone?, language?, ai_agent_enabled?, auto_reply_enabled?, business_hours?, low_balance_alert? }` |

`business_hours` shape:
```json
{
  "mon": { "open": "09:00", "close": "18:00" },
  "tue": { "open": "09:00", "close": "18:00" },
  "sun": { "closed": true }
}
```

---

### ROLES

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /roles | JWT | List roles (paginated) |
| GET | /roles/:role_name | JWT | Get role |
| POST | /roles/create | JWT | Create role with permissions JSON |
| PUT | /roles/update/:role_id | JWT | Update role |

---

### CATALOG (Primary product/service CRUD) ⭐ USE THIS, not /products

`item_type` values: `physical_product` | `accommodation` | `activity` | `service`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /catalog | JWT | List items. `?item_type=&category=&is_active=&page=&limit=` |
| POST | /catalog | JWT+SUB | Create item |
| GET | /catalog/:itemId | JWT+SUB | Get item by ID |
| PATCH | /catalog/:itemId | JWT+SUB | Update item |
| DELETE | /catalog/:itemId | JWT+SUB | Soft-delete |
| PATCH | /catalog/:itemId/stock | JWT+SUB | `{ quantity_delta }` |
| GET | /catalog/:itemId/variants | JWT+SUB | List variants |
| POST | /catalog/:itemId/variants | JWT+SUB | Create variant |
| PATCH | /catalog/variants/:variantId | JWT+SUB | Update variant |
| DELETE | /catalog/variants/:variantId | JWT+SUB | Delete variant |
| GET | /catalog/:itemId/availability | JWT+SUB | Date-based slot availability |
| POST | /catalog/:itemId/availability | JWT+SUB | Set availability for a date |
| PATCH | /catalog/:itemId/availability/block | JWT+SUB | Block a date |
| GET | /catalog/config | JWT | Schema config for UI (shows which fields per item_type) |

---

### CUSTOMERS

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /customers | JWT | `?business_id=&search=&page=&limit=&sort_by=&order=` |
| GET | /customers/:id | JWT | Get customer |
| POST | /customers | JWT | Create customer |
| POST | /customers/find-or-create | JWT | `{ phone, business_id }` — idempotent |
| POST | /customers/bulk | JWT | Bulk CSV import |
| GET | /customers/top | JWT | Top customers by spend/orders |
| GET | /customers/segments | JWT | Segmented buckets (new/loyal/at-risk/VIP) |
| PUT | /customers/:id | JWT | Update customer |
| PATCH | /customers/:id/engagement | JWT | Update engagement score |
| DELETE | /customers/:id | JWT | Soft-delete |

---

### LEADS

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /leads | JWT | Create lead |
| GET | /leads | JWT | `?status=&channel=&assigned_to=&page=&limit=` |
| GET | /leads/:id | JWT | Get lead with events |
| PATCH | /leads/:id | JWT | Update lead |
| DELETE | /leads/:id | JWT | Soft-delete |
| GET | /leads/dashboard | JWT | Dashboard counts (new/active/won/lost) |
| POST | /leads/:id/events | JWT | Append event to lead timeline |
| POST | /leads/:id/followups | JWT | Schedule follow-up |
| GET | /leads/:id/followups | JWT | List follow-ups |
| PATCH | /leads/:id/followups/:followupId/done | JWT | Mark follow-up done |

---

### ORDERS ⚠️ Breaking change: `product_id` renamed to `item_id`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /orders | JWT | Create order. Items use `item_id` (catalog_items PK) |
| GET | /orders | JWT | `?status=&payment_status=&page=&limit=` |
| GET | /orders/:id | JWT | Get order with order_items |
| PUT | /orders/:id | JWT | Update order |
| PATCH | /orders/:id/status | JWT | `{ status }` |
| PATCH | /orders/:id/payment | JWT | Confirm payment |
| PATCH | /orders/:id/shipping | JWT | `{ tracking_number, shipped_at }` |
| DELETE | /orders/:id | JWT | Cancel order |

**⚠️ Breaking change**: `CreateOrderItemDto.product_id` is now `item_id`. If you were passing `product_id`, update to `item_id` (UUID from `/catalog`).

---

### CART

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /cart/:leadId/:businessId | JWT | Get active cart |
| POST | /cart/add | JWT | `{ lead_id, business_id, item_id, variant_id?, quantity }` |
| PUT | /cart/item/:cartItemId | JWT | `{ quantity }` |
| DELETE | /cart/item/:cartItemId | JWT | Remove item |
| DELETE | /cart/:cartId | JWT | Clear cart |
| POST | /cart/checkout | JWT | Convert cart → order |

---

### BOOKINGS

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /bookings | JWT | Create booking (hospitality/tours) |
| GET | /bookings | JWT | `?status=&page=&limit=` |
| GET | /bookings/:bookingId | JWT | Get booking |
| PATCH | /bookings/:bookingId/cancel | JWT | Cancel |

---

### PAYMENTS (Order payments via Razorpay)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /payments | JWT | Create Razorpay order → returns `razorpay_order_id` for checkout |
| POST | /payments/verify | JWT | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` |
| POST | /payments/:id/capture | JWT | Manual capture (2-step flow) |
| POST | /payments/:id/refund | JWT | `{ amount? }` — full if no amount |
| GET | /payments | JWT | List with `?status=&page=&limit=` |
| GET | /payments/analytics | JWT | Revenue, success rate, method breakdown |
| GET | /payments/:id | JWT | Get payment |
| GET | /payments/order/:orderId | JWT | Get payment for order |

---

### BILLING / SUBSCRIPTION ⭐ NEW SYSTEM

Subscription gates many features (SubscriptionGuard). Show upgrade prompt on 403.

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /billing/plans | PUBLIC | Plans by `?business_type=hospitality\|tours_activities\|products\|services&interval=monthly\|yearly` |
| GET | /billing/credit-pricing | PUBLIC | Cost per action (marketing_conversation, flow_session, etc.) |
| GET | /billing/subscription | JWT | Current subscription + plan details |
| POST | /billing/subscription | JWT | `{ plan_id }` → returns Razorpay checkout URL |
| PATCH | /billing/subscription/pause | JWT | `{ pause_start, pause_end }` — monsoon pause |
| PATCH | /billing/subscription/resume | JWT | Early resume |
| DELETE | /billing/subscription | JWT | Cancel at period end |
| GET | /billing/wallet | JWT | Balance + last 20 transactions |
| GET | /billing/wallet/transactions | JWT | `?page=&limit=` |
| POST | /billing/wallet/topup | JWT | `{ amount }` (in ₹) → returns `razorpay_order_id` |
| GET | /billing/invoices | JWT | List invoices with GST |
| GET | /billing/invoices/:id/pdf | JWT | Download invoice PDF |

**Subscription statuses**: `created` | `authenticated` | `active` | `past_due` | `paused` | `cancelled` | `expired`

Show warning banner on `past_due`. Block on `cancelled` / `expired`.

**Wallet credit pricing** (shown in dashboard):
| Action | Cost |
|--------|------|
| marketing_conversation | ₹1.50 |
| utility_conversation | ₹0.80 |
| service_conversation | ₹0.50 |
| flow_session | ₹2.00 |
| template_send | ₹0.80 |
| campaign_recipient | ₹1.50 |

---

### CAMPAIGNS ⭐ Requires active subscription

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /campaigns | JWT+SUB | Create campaign (draft) |
| GET | /campaigns | JWT+SUB | List campaigns |
| GET | /campaigns/:id | JWT+SUB | Get campaign |
| GET | /campaigns/:id/analytics | JWT+SUB | Delivery/read rates |
| GET | /campaigns/:id/recipients | JWT+SUB | Per-recipient status |
| POST | /campaigns/:id/launch | JWT+SUB | Schedule & launch |
| PATCH | /campaigns/:id/pause | JWT+SUB | Pause sending |
| PATCH | /campaigns/:id/cancel | JWT+SUB | Cancel |
| DELETE | /campaigns/:id | JWT+SUB | Delete |
| POST | /campaigns/bulk | JWT+SUB | Quick bulk message (no campaign setup) |

---

### WHATSAPP

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /whatsapp/accounts | JWT | List connected WA accounts |
| POST | /whatsapp/accounts/connect | JWT | `{ whatsappBusinessAccountId, phoneNumberId, businessId }` |
| DELETE | /whatsapp/accounts/:accountId | JWT | Disconnect |
| POST | /whatsapp/messages/send | JWT | `{ phoneNumberId, to, message }` |
| POST | /whatsapp/messages/button | JWT | Interactive button message |
| POST | /whatsapp/messages/list | JWT | Interactive list message |
| GET | /whatsapp/oauth/url | JWT | Get Facebook OAuth URL for setup |
| POST | /whatsapp/oauth/embedded-callback | JWT | After embedded signup |
| GET | /whatsapp/webhook | PUBLIC | Webhook verification (Facebook) |
| POST | /whatsapp/webhook | HMAC | Inbound message handler |

**Gupshup onboarding** (alternative to direct Meta):
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /gupshup/onboarding/embed-link | JWT | Get signup URL |
| POST | /gupshup/onboarding/complete | JWT | Finalize account |

---

### WHATSAPP TEMPLATES

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /whatsapp/templates | JWT | List templates |
| GET | /whatsapp/templates/approved | JWT | Only approved templates |
| POST | /whatsapp/templates | JWT | Create template |
| PATCH | /whatsapp/templates/:id | JWT | Update draft |
| POST | /whatsapp/templates/:id/submit | JWT | Submit to Meta for review |
| POST | /whatsapp/templates/:id/sync | JWT | Sync approval status |
| DELETE | /whatsapp/templates/:id | JWT | Delete |
| POST | /whatsapp/templates/sync-from-meta | JWT | Import all from Meta |

---

### WHATSAPP FLOWS

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /whatsapp/flows | JWT | List flows |
| POST | /whatsapp/flows | JWT | Create flow draft |
| GET | /whatsapp/flows/:id | JWT | Get flow |
| PATCH | /whatsapp/flows/:id | JWT | Update draft |
| POST | /whatsapp/flows/:id/submit | JWT | Upload to Meta |
| POST | /whatsapp/flows/:id/publish | JWT | Go live |
| POST | /whatsapp/flows/:id/deprecate | JWT | Deprecate |
| POST | /whatsapp/flows/sync-from-meta | JWT | Import flows from Meta |
| DELETE | /whatsapp/flows/:id | JWT | Delete |

---

### INSTAGRAM

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /instagram/auth/url | JWT | Get OAuth URL |
| POST | /instagram/accounts/connect | JWT | Connect IG account |
| GET | /instagram/accounts | JWT | List connected accounts |
| DELETE | /instagram/accounts/:accountId | JWT | Disconnect |
| POST | /instagram/accounts/:accountId/sync | JWT | Sync account data |
| GET | /instagram/conversations | JWT | Inbox DMs |
| GET | /instagram/conversations/:id/messages | JWT | Thread messages |
| POST | /instagram/reply/message | JWT | Reply to DM |
| POST | /instagram/reply/comment | JWT | Reply to comment |
| GET | /instagram/media | JWT | Posts/reels list |
| GET | /instagram/insights/account | JWT | Account analytics |

---

### INBOX (Unified message inbox — MongoDB required)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /inbox/conversations | JWT | All channels combined |
| GET | /inbox/conversations/:id | JWT | Conversation detail |
| GET | /inbox/conversations/:id/messages | JWT | Message thread |
| POST | /inbox/conversations/:id/send | JWT | Send reply |
| PATCH | /inbox/conversations/:id | JWT | Update status, tags |
| POST | /inbox/conversations/:id/resolve | JWT | Close |
| POST | /inbox/conversations/:id/takeover | JWT | Human takeover |

---

### HUMAN HANDOFF

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /handoff/queue | JWT | Pending escalations |
| POST | /handoff/conversations/:id/takeover | JWT | Agent assigns to self |
| POST | /handoff/conversations/:id/send | JWT | Agent reply |
| POST | /handoff/conversations/:id/resolve | JWT | Close handoff |

---

### ANALYTICS

All use JWT. `?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` on all.

| Method | Path | Notes |
|--------|------|-------|
| GET | /analytics/dashboard | Overview KPIs — Redis cached 5min |
| GET | /analytics/sales | Revenue, order count, top items |
| GET | /analytics/sales/top-products | Top 10 by revenue |
| GET | /analytics/sales/revenue-by-period | `?period=day\|week\|month` |
| GET | /analytics/customers | Total, new, returning |
| GET | /analytics/customers/cohort-analysis | Retention by signup month |
| GET | /analytics/customers/churn-analysis | Churn rate |
| GET | /analytics/funnel | Lead → quoted → won funnel |
| GET | /analytics/occupancy | Hospitality occupancy |
| GET | /analytics/inventory | Stock levels, turnover |
| GET | /analytics/kpis | All business KPIs in one call |

---

### NOTIFICATIONS

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /notifications/send | JWT | Single notification |
| POST | /notifications/send/bulk | JWT | Bulk to customer list |
| POST | /notifications/send/multi-channel | JWT | Send across email/SMS/WhatsApp simultaneously |
| GET | /notifications | JWT | `?status=pending\|sent\|failed` |
| GET | /notifications/unread | JWT | Unread count |
| GET | /notifications/preferences/customer/:customerId | JWT | Customer opt-in preferences |
| PUT | /notifications/preferences/customer/:customerId | JWT | Update preferences |

---

### NOTIFICATION TEMPLATES

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /notification-templates | JWT | List all templates |
| POST | /notification-templates | JWT | Create |
| GET | /notification-templates/:id | JWT | Get |
| PUT | /notification-templates/:id | JWT | Update |
| DELETE | /notification-templates/:id | JWT | Delete |
| POST | /notification-templates/clone | JWT | Clone existing |
| POST | /notification-templates/preview | JWT | Preview with variables |
| POST | /notification-templates/test | JWT | Send test message |

---

### HOTEL PRICING (Hospitality business_type only)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /hotel-pricing/profiles | JWT | Create hotel profile |
| GET | /hotel-pricing/profiles | JWT | List profiles |
| PATCH | /hotel-pricing/profiles/:id | JWT | Update |
| POST | /hotel-pricing/pricing/recommend | JWT | AI price recommendation for date |
| GET | /hotel-pricing/pricing/history | JWT | Past recommendations |
| POST | /hotel-pricing/pricing/outcome | JWT | Record actual booking outcome |
| GET | /hotel-pricing/notifications | JWT | Price alerts |
| PATCH | /hotel-pricing/notifications/:id/read | JWT | Mark read |
| GET | /hotel-pricing/competitor/rates | JWT | Competitor rates |
| GET | /hotel-pricing/competitor/nearby | PUBLIC | Find nearby hotels |

---

### WORKFLOWS (Visual automation builder)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /workflows/nodes | JWT | Available node types |
| GET | /workflows/variables | JWT | Available variables for conditions |
| GET | /workflows/business/:businessId | JWT | Workflows for business |
| POST | /workflows | JWT | Create workflow |
| PUT | /workflows | JWT | Update workflow |
| POST | /workflows/initiate | JWT | Trigger workflow manually |

---

### RAG (AI Knowledge Base)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /rag/ingest | JWT | Upload documents for AI to reference |
| DELETE | /rag/documents | JWT | Remove documents |

---

### FILE UPLOADS (S3)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /s3/upload | JWT | `multipart/form-data` — returns `{ url, key }` |
| POST | /s3/upload-multiple | JWT | Multiple files |
| POST | /s3/upload-base64 | JWT | `{ data: "base64...", filename, contentType }` → max 50MB |
| POST | /s3/upload-base64-multiple | JWT | Array of base64 images |
| POST | /s3/signed-url | JWT | Get pre-signed upload URL |
| DELETE | /s3/:key | JWT | Delete file |

---

### CHAT WIDGET (Embeddable)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /widget/script/:businessId | PUBLIC | Widget JS bundle |
| GET | /widget/config/:businessId | PUBLIC | Widget appearance config |
| GET | /widget/embed/:businessId | PUBLIC | Embed code snippet |
| POST | /widget/init | PUBLIC | Init visitor session |
| POST | /widget/message | PUBLIC | Customer sends message |
| GET | /widget/history | PUBLIC | Load chat history |

---

### AUDIT LOGS ⭐ NEW

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /audit-logs | JWT | `?page=&limit=&entity_type=order\|customer\|lead\|subscription` |

Returns: who did what, when (business_id, user_id, action, entity_type, entity_id, old/new values, IP).

---

## Recent Backend Changes That Affect Frontend

### 1. Order creation: `product_id` → `item_id`
```js
// OLD (broken)
items: [{ product_id: "...", quantity: 1 }]

// NEW (correct)
items: [{ item_id: "...", quantity: 1 }]
```
`item_id` comes from `/catalog` (not `/products`). Use `/catalog` for all product/service CRUD.

### 2. New subscription system (billing module)
- All `/campaigns`, `/catalog` write operations, and WhatsApp flows require an **active subscription**
- On `403` from a `JWT+SUB` route → show upgrade/subscription page
- Wallet balance shown in dashboard header (low-balance warning at ₹100)
- `GET /billing/subscription` on app load to check current status

### 3. New endpoints (never existed before)
- `GET /business-settings` + `PATCH /business-settings` — onboarding wizard, AI toggle, timezone
- `GET /audit-logs` — activity log page

### 4. Soft-delete on users and customers
- Deleted users/customers no longer appear in list responses
- `DELETE /customers/:id` now soft-deletes (preserves order history)

### 5. Analytics dashboard is Redis-cached (5 min TTL)
- No need to debounce calls to `/analytics/dashboard`
- Other analytics endpoints are NOT cached — add loading states

### 6. All business_id is from JWT, never from URL
- You no longer need to pass `business_id` as a query param — the backend reads it from your JWT
- Passing `business_id` in query/body is ignored on protected routes

---

## ❓ Ask Frontend Developer — Which of These Pages Are Done?

Go through this list and confirm status for each:

**Auth**
- [ ] Signup page
- [ ] Login page
- [ ] Token refresh (auto on 401)

**Onboarding**
- [ ] Business type selection
- [ ] WhatsApp connection (Gupshup or direct OAuth)
- [ ] Subscription plan selection (`GET /billing/plans`)
- [ ] Business settings setup (`PATCH /business-settings`)

**Dashboard**
- [ ] KPI cards (`GET /analytics/dashboard`)
- [ ] Revenue chart (`GET /analytics/sales/revenue-by-period`)
- [ ] Wallet balance + low balance warning (`GET /billing/wallet`)
- [ ] Subscription status banner

**Leads**
- [ ] Lead list + filters
- [ ] Lead detail with timeline (lead_events)
- [ ] Follow-up scheduler
- [ ] Pipeline view (kanban by status)

**Customers**
- [ ] Customer list (search, filter, pagination)
- [ ] Customer detail (orders, engagement score)
- [ ] Bulk import CSV

**Catalog / Products**
- [ ] Product/service list (`GET /catalog`)
- [ ] Create/edit item form (all 4 item_types)
- [ ] Variant management
- [ ] Availability calendar (accommodation/activity/service)
- [ ] Stock management (physical_product)

**Orders**
- [ ] Order list
- [ ] Order detail
- [ ] Create order
- [ ] Status update flow

**Payments**
- [ ] Razorpay checkout integration
- [ ] Payment verification (`POST /payments/verify`)
- [ ] Refund flow

**Billing (subscription)**
- [ ] Plan selection + checkout
- [ ] Wallet balance + topup
- [ ] Invoice list + PDF download
- [ ] Subscription pause/resume

**Campaigns**
- [ ] Campaign builder (template + audience)
- [ ] Launch + schedule
- [ ] Analytics (delivery/read rates)

**WhatsApp**
- [ ] Account connect (OAuth or Gupshup)
- [ ] Template list + submission
- [ ] Flow builder
- [ ] Inbox / conversation view (`/inbox/conversations`)

**Instagram**
- [ ] OAuth connect
- [ ] DM inbox
- [ ] Comment management
- [ ] Insights

**Analytics**
- [ ] Sales dashboard
- [ ] Customer cohort/churn
- [ ] Funnel chart
- [ ] Occupancy (hospitality)

**Settings**
- [ ] Business profile (`PATCH /businesses/:id`)
- [ ] Business settings (`PATCH /business-settings`)
- [ ] Team members (users CRUD)
- [ ] Roles + permissions
- [ ] Notification preferences

---

## WebSocket Events (Real-time)

The backend exposes Socket.IO at the root namespace. Connect after JWT auth:

```js
import { io } from "socket.io-client";
const socket = io("http://localhost:3000", {
  auth: { token: accessToken }
});

// Events to listen for:
socket.on("message:new",           (msg) => /* new inbound message */);
socket.on("conversation:updated",  (c)   => /* conversation status change */);
socket.on("handoff:requested",     (c)   => /* AI escalated to human */);
socket.on("handoff:resolved",      (c)   => /* agent resolved */);
```

---

## Error Handling Cheat Sheet

```js
async function apiCall(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAccessToken()}`,
      ...options.headers,
    }
  });

  if (res.status === 401) {
    // Token expired — refresh and retry
    await refreshToken();
    return apiCall(url, options);
  }

  if (res.status === 403) {
    const body = await res.json();
    if (body.message?.includes("subscription")) {
      // Redirect to subscription/upgrade page
      redirectToUpgrade();
      return;
    }
    throw new Error("Forbidden");
  }

  if (res.status === 429) {
    // Rate limit — wait and retry
    await sleep(1000);
    return apiCall(url, options);
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "API error");
  }

  return res.json();
}
```

---

## Environment Variables Needed on Frontend

```
VITE_API_BASE_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx        # from Razorpay dashboard
VITE_WS_URL=http://localhost:3000          # WebSocket URL
```
