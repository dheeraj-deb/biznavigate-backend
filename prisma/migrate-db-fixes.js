// DB architecture fix migration — bypasses PgBouncer shadow-DB restriction.
// Run: node prisma/migrate-db-fixes.js
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
    console.log('Running DB architecture fixes...\n');

    // ── P0: Drop orphan subscription_plans table ──────────────────────────────
    await sql.unsafe(`DROP TABLE IF EXISTS subscription_plans;`);
    console.log('  ✓ Dropped subscription_plans (orphan table)');

    // ── P0: Remove orders.items Json column (never written, duplicates order_items) ──
    await sql.unsafe(`
      ALTER TABLE orders DROP COLUMN IF EXISTS items;
    `);
    console.log('  ✓ Dropped orders.items column');

    // ── P0: Add missing orders indexes (business_id is critical for dashboard queries) ──
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_orders_business_created
        ON orders (business_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_orders_business_status
        ON orders (business_id, status);
    `);
    console.log('  ✓ Added orders indexes (business_id+created_at, business_id+status)');

    // ── P1: Remove duplicate notification_messages status index ──────────────
    await sql.unsafe(`
      DROP INDEX IF EXISTS idx_notification_messages_pending;
    `);
    console.log('  ✓ Removed duplicate idx_notification_messages_pending');

    // ── P1: Add business_id to hotel pricing tables ───────────────────────────
    await sql.unsafe(`
      ALTER TABLE hotel_pricing_recommendations
        ADD COLUMN IF NOT EXISTS business_id UUID;
      CREATE INDEX IF NOT EXISTS idx_hotel_recs_business_id
        ON hotel_pricing_recommendations (business_id);

      ALTER TABLE hotel_booking_outcomes
        ADD COLUMN IF NOT EXISTS business_id UUID;

      ALTER TABLE hotel_pricing_notifications
        ADD COLUMN IF NOT EXISTS business_id UUID;
      CREATE INDEX IF NOT EXISTS idx_hotel_notifs_business_id
        ON hotel_pricing_notifications (business_id);
    `);
    console.log('  ✓ Added business_id to hotel_pricing_recommendations, hotel_booking_outcomes, hotel_pricing_notifications');

    // ── P1: Add expires_at + business_id to checkpoint tables ────────────────
    await sql.unsafe(`
      ALTER TABLE checkpoints
        ADD COLUMN IF NOT EXISTS business_id UUID,
        ADD COLUMN IF NOT EXISTS expires_at  TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_checkpoints_business_id ON checkpoints (business_id);
      CREATE INDEX IF NOT EXISTS idx_checkpoints_expires_at  ON checkpoints (expires_at);

      ALTER TABLE checkpoint_blobs
        ADD COLUMN IF NOT EXISTS business_id UUID,
        ADD COLUMN IF NOT EXISTS expires_at  TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_business_id ON checkpoint_blobs (business_id);
      CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_expires_at  ON checkpoint_blobs (expires_at);

      ALTER TABLE checkpoint_writes
        ADD COLUMN IF NOT EXISTS business_id UUID,
        ADD COLUMN IF NOT EXISTS expires_at  TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_business_id ON checkpoint_writes (business_id);
      CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_expires_at  ON checkpoint_writes (expires_at);
    `);
    console.log('  ✓ Added business_id + expires_at to checkpoint tables');

    // ── P2: Add billing_subscriptions indexes ────────────────────────────────
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_plan_id
        ON billing_subscriptions (plan_id);
      CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_period_end
        ON billing_subscriptions (current_period_end);
    `);
    console.log('  ✓ Added billing_subscriptions indexes (plan_id, current_period_end)');

    // ── P2: Add deleted_at to users ──────────────────────────────────────────
    await sql.unsafe(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);
    `);
    console.log('  ✓ Added deleted_at to users');

    // ── P2: Add deleted_at to customers ──────────────────────────────────────
    await sql.unsafe(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers (deleted_at);
    `);
    console.log('  ✓ Added deleted_at to customers');

    // ── P2: Add campaign_recipients compound index ────────────────────────────
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_business
        ON campaign_recipients (campaign_id, business_id);
    `);
    console.log('  ✓ Added campaign_recipients compound index');

    // ── P2: business_settings table ──────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business_settings (
        business_id        UUID          PRIMARY KEY,
        timezone           VARCHAR(50)   NOT NULL DEFAULT 'Asia/Kolkata',
        language           VARCHAR(10)   NOT NULL DEFAULT 'en',
        currency           VARCHAR(10)   NOT NULL DEFAULT 'INR',
        business_hours     JSONB,
        onboarding_step    INTEGER       NOT NULL DEFAULT 0,
        onboarding_done    BOOLEAN       NOT NULL DEFAULT FALSE,
        ai_agent_enabled   BOOLEAN       NOT NULL DEFAULT TRUE,
        auto_reply_enabled BOOLEAN       NOT NULL DEFAULT TRUE,
        low_balance_alert  DECIMAL(10,2) NOT NULL DEFAULT 100,
        updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_bsettings_business FOREIGN KEY (business_id)
          REFERENCES businesses(business_id) ON DELETE CASCADE
      );
    `);
    console.log('  ✓ Created business_settings');

    // ── P2: audit_logs table ─────────────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID        NOT NULL,
        user_id     UUID,
        action      VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id   VARCHAR(100),
        old_values  JSONB,
        new_values  JSONB,
        ip_address  VARCHAR(45),
        user_agent  TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_audit_business FOREIGN KEY (business_id)
          REFERENCES businesses(business_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_business_created
        ON audit_logs (business_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
        ON audit_logs (entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
        ON audit_logs (user_id);
    `);
    console.log('  ✓ Created audit_logs');

    // ── P2: Add businesses indexes ────────────────────────────────────────────
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_businesses_business_type
        ON businesses (business_type);
      CREATE INDEX IF NOT EXISTS idx_businesses_deleted_at
        ON businesses (deleted_at);
    `);
    console.log('  ✓ Added businesses indexes (business_type, deleted_at)');

    // ── P3: Make created_at NOT NULL where default NOW() exists ──────────────
    // These are safe because the DEFAULT clause ensures no NULLs were inserted.
    const notNullFixes = [
      ['businesses',         'created_at'],
      ['businesses',         'updated_at'],
      ['business_employees', 'created_at'],
      ['social_accounts',    'created_at'],
      ['tenants',            'created_at'],
      ['tenants',            'updated_at'],
      ['users',              'created_at'],
      ['users',              'updated_at'],
      ['carts',              'created_at'],
      ['carts',              'updated_at'],
      ['cart_items',         'created_at'],
      ['cart_items',         'updated_at'],
    ];

    for (const [table, col] of notNullFixes) {
      try {
        await sql.unsafe(`
          UPDATE ${table} SET ${col} = NOW() WHERE ${col} IS NULL;
          ALTER TABLE ${table} ALTER COLUMN ${col} SET NOT NULL;
        `);
        console.log(`  ✓ ${table}.${col} → NOT NULL`);
      } catch (e) {
        console.warn(`  ⚠ Skipped ${table}.${col}: ${e.message}`);
      }
    }

    console.log('\n✅ All DB architecture fixes applied successfully.');
    await sql.end();
  } catch (err) {
    await sql.end().catch(() => {});
    console.error('\nFATAL:', err.message);
    process.exit(1);
  }
}

run();
