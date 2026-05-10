// Direct SQL migration for billing tables — bypasses PgBouncer shadow-DB restriction.
// Run: node prisma/migrate-billing.js
const postgres = require('postgres');
require('dotenv').config();

async function run() {
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.delete('pgbouncer');
  url.searchParams.delete('statement_cache_size');
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  const sql = postgres(url.toString(), {
    prepare: false, ssl: 'require', idle_timeout: 30,
    connection: { search_path: schema },
    max: 1,
  });

  try {
    console.log('Creating billing tables...\n');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS billing_plans (
        plan_id            VARCHAR(50)    PRIMARY KEY,
        razorpay_plan_id   VARCHAR(100)   UNIQUE,
        name               VARCHAR(100)   NOT NULL,
        business_type      VARCHAR(30)    NOT NULL,
        tier               VARCHAR(20)    NOT NULL,
        amount             INTEGER        NOT NULL,
        interval           VARCHAR(20)    NOT NULL,
        interval_count     INTEGER        NOT NULL DEFAULT 1,
        initial_credits    DECIMAL(12,2)  NOT NULL DEFAULT 0,
        features           JSONB          NOT NULL DEFAULT '{}',
        is_active          BOOLEAN        NOT NULL DEFAULT TRUE,
        created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_billing_plans_type_interval
        ON billing_plans (business_type, interval, is_active);
    `);
    console.log('  ✓ billing_plans');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS billing_subscriptions (
        subscription_id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id              UUID         NOT NULL UNIQUE,
        plan_id                  VARCHAR(50)  NOT NULL,
        razorpay_subscription_id VARCHAR(100) UNIQUE,
        status                   VARCHAR(30)  NOT NULL,
        current_period_start     TIMESTAMPTZ,
        current_period_end       TIMESTAMPTZ,
        trial_end                TIMESTAMPTZ,
        pause_start              TIMESTAMPTZ,
        pause_end                TIMESTAMPTZ,
        cancel_at_period_end     BOOLEAN      NOT NULL DEFAULT FALSE,
        cancelled_at             TIMESTAMPTZ,
        metadata                 JSONB,
        created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_bsub_business FOREIGN KEY (business_id) REFERENCES businesses(business_id),
        CONSTRAINT fk_bsub_plan     FOREIGN KEY (plan_id)     REFERENCES billing_plans(plan_id)
      );
      CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status
        ON billing_subscriptions (status);
      CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_rzp
        ON billing_subscriptions (razorpay_subscription_id);
    `);
    console.log('  ✓ billing_subscriptions');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS wallets (
        wallet_id   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID          NOT NULL UNIQUE,
        balance     DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
        currency    VARCHAR(10)   NOT NULL DEFAULT 'INR',
        created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_wallet_business FOREIGN KEY (business_id) REFERENCES businesses(business_id)
      );
    `);
    console.log('  ✓ wallets');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        txn_id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id      UUID          NOT NULL,
        type           VARCHAR(10)   NOT NULL CHECK (type IN ('credit','debit')),
        amount         DECIMAL(12,2) NOT NULL,
        balance_before DECIMAL(12,2) NOT NULL,
        balance_after  DECIMAL(12,2) NOT NULL,
        description    VARCHAR(255)  NOT NULL,
        reference_id   VARCHAR(100),
        reference_type VARCHAR(50),
        action_type    VARCHAR(50),
        status         VARCHAR(20)   NOT NULL DEFAULT 'completed',
        metadata       JSONB,
        created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_wt_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id)
      );
      CREATE INDEX IF NOT EXISTS idx_wallet_txn_wallet_created
        ON wallet_transactions (wallet_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_wallet_txn_reference
        ON wallet_transactions (reference_id);
    `);
    console.log('  ✓ wallet_transactions');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS billing_payments (
        payment_id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id         UUID         NOT NULL,
        razorpay_payment_id VARCHAR(100) NOT NULL UNIQUE,
        razorpay_order_id   VARCHAR(100),
        amount              INTEGER      NOT NULL,
        type                VARCHAR(30)  NOT NULL,
        status              VARCHAR(20)  NOT NULL,
        idempotency_key     VARCHAR(100) NOT NULL UNIQUE,
        metadata            JSONB,
        created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_bp_business FOREIGN KEY (business_id) REFERENCES businesses(business_id)
      );
      CREATE INDEX IF NOT EXISTS idx_billing_payments_business
        ON billing_payments (business_id, created_at DESC);
    `);
    console.log('  ✓ billing_payments');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS billing_invoices (
        invoice_id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id         UUID         NOT NULL,
        subscription_id     UUID,
        razorpay_invoice_id VARCHAR(100),
        subtotal            INTEGER      NOT NULL,
        tax_amount          INTEGER      NOT NULL,
        total_amount        INTEGER      NOT NULL,
        status              VARCHAR(20)  NOT NULL,
        pdf_url             VARCHAR(500),
        due_date            DATE,
        paid_at             TIMESTAMPTZ,
        created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_bi_business     FOREIGN KEY (business_id)    REFERENCES businesses(business_id),
        CONSTRAINT fk_bi_subscription FOREIGN KEY (subscription_id) REFERENCES billing_subscriptions(subscription_id)
      );
      CREATE INDEX IF NOT EXISTS idx_billing_invoices_business
        ON billing_invoices (business_id, created_at DESC);
    `);
    console.log('  ✓ billing_invoices');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS billing_webhook_events (
        event_id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        provider          VARCHAR(30)  NOT NULL,
        event_type        VARCHAR(100) NOT NULL,
        razorpay_event_id VARCHAR(150) UNIQUE,
        payload           JSONB        NOT NULL,
        status            VARCHAR(20)  NOT NULL DEFAULT 'pending',
        attempts          INTEGER      NOT NULL DEFAULT 0,
        error             TEXT,
        processed_at      TIMESTAMPTZ,
        created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_billing_webhook_status
        ON billing_webhook_events (status, created_at);
    `);
    console.log('  ✓ billing_webhook_events');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS credit_pricing (
        action_type  VARCHAR(50)  PRIMARY KEY,
        cost         DECIMAL(8,4) NOT NULL,
        description  VARCHAR(255) NOT NULL,
        is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);
    console.log('  ✓ credit_pricing');

    console.log('\nAll billing tables created successfully.');
    await sql.end();
  } catch (err) {
    await sql.end().catch(() => {});
    console.error('\nFATAL:', err.message);
    process.exit(1);
  }
}

run();
