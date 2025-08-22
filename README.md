# Order Automation API

This project handles order automation via WhatsApp and CRM sync.

### DB Credentials
- `email` - dheerajknight81@gmail.com
- `password` - wmMVXHK!$B6T9f9

### Modules
- `whatsapp` – Listens to and parses WhatsApp messages.
- `order` – Handles order creation and status.
- `product` – Product catalog management.
- `crm` – Integration layer for Tally, Zoho, etc.

### Setup

```bash
npm install
npx prisma db pull
npx prisma generate
npm run start:dev
```

Ensure PostgreSQL is running and `.env` is configured properly.


### ENV VARIABLES

# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api
CORS_ORIGIN=*

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600 # 1 hour

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ordersdb

# Twilio Configuration
TWILIO_SID=AC19fa060e5047f5af9b81450edc56838b
TWILIO_AUTH_TOKEN=86021fcfcfdbf306ebb294a020c90de3
TWILIO_PHONE_NUMBER=+14155238886
TWILIO_WEBHOOK_URL=https://your-domain.com/whatsapp/webhook
TWILIO_STATUS_CALLBACK_URL=https://your-domain.com/whatsapp/status

# WhatsApp Configuration
WHATSAPP_VERIFY_TOKEN=your_verify_token_here

# Zoho Configuration
ZOHO_CLIENT_ID=1000.NIIO305M71RIEIS6GP0HKL9OQM10HP
ZOHO_CLIENT_SECRET=f9e61cf16c55a874fec0a97f7f345109a32a362304
ZOHO_REDIRECT_URI=https://0465fb375596.ngrok-free.app/business-user/auth/callback
ZOHO_SCOPE=ZohoInventory.items.READ,ZohoInventory.inventoryadjustments.CREATE,ZohoInventory.contacts.READ,ZohoInventory.contacts.CREATE,ZohoInventory.settings.READ
ZOHO_API_DOMAIN=https://www.zohoapis.in
ZOHO_AUTH_URL=https://accounts.zoho.in/oauth/v2/auth
ZOHO_TOKEN_URL=https://accounts.zoho.in/oauth/v2/token
ZOHO_INVENTORY_URL=https://www.zohoapis.in/inventory/v1

# This was inserted by `prisma init`:
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://neondb_owner:npg_u0jSwQmldo7P@ep-silent-block-a8io1251-pooler.eastus2.azure.neon.tech/biznavigate?sslmode=require"
