# Order Automation API

This project handles order automation via WhatsApp and CRM sync.

### Modules
- `whatsapp` – Listens to and parses WhatsApp messages.
- `order` – Handles order creation and status.
- `product` – Product catalog management.
- `crm` – Integration layer for Tally, Zoho, etc.

### Setup

```bash
npm install
npm run start:dev
```

Ensure PostgreSQL is running and `.env` is configured properly.
