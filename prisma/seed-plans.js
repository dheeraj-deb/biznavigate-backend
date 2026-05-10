// Seeds billing_plans and credit_pricing tables.
// Run: node prisma/seed-plans.js
const postgres = require('postgres');
require('dotenv').config();

const PLANS = [
  // ── HOSPITALITY ────────────────────────────────────────────────────────────
  { plan_id: 'hosp_starter_m', name: 'Homestay',          business_type: 'hospitality', tier: 'starter',
    amount: 149900,  interval: 'monthly', initial_credits: 500,
    features: { staff_users: 1, campaigns: false, channel_manager: false, dynamic_pricing: false } },
  { plan_id: 'hosp_growth_m',  name: 'Resort',            business_type: 'hospitality', tier: 'growth',
    amount: 299900,  interval: 'monthly', initial_credits: 1500,
    features: { staff_users: 3, campaigns: true,  channel_manager: false, dynamic_pricing: true } },
  { plan_id: 'hosp_pro_m',     name: 'Pro',               business_type: 'hospitality', tier: 'pro',
    amount: 549900,  interval: 'monthly', initial_credits: 4000,
    features: { staff_users: -1, campaigns: true, channel_manager: true,  dynamic_pricing: true } },
  { plan_id: 'hosp_starter_y', name: 'Homestay (Annual)', business_type: 'hospitality', tier: 'starter',
    amount: 1499000, interval: 'yearly',  initial_credits: 7000,
    features: { staff_users: 1, campaigns: false, channel_manager: false, dynamic_pricing: false } },
  { plan_id: 'hosp_growth_y',  name: 'Resort (Annual)',   business_type: 'hospitality', tier: 'growth',
    amount: 2999000, interval: 'yearly',  initial_credits: 22000,
    features: { staff_users: 3, campaigns: true,  channel_manager: false, dynamic_pricing: true } },
  { plan_id: 'hosp_pro_y',     name: 'Pro (Annual)',      business_type: 'hospitality', tier: 'pro',
    amount: 5499000, interval: 'yearly',  initial_credits: 60000,
    features: { staff_users: -1, campaigns: true, channel_manager: true,  dynamic_pricing: true } },

  // ── TOURS & ACTIVITIES ─────────────────────────────────────────────────────
  { plan_id: 'tour_starter_m', name: 'Starter',           business_type: 'tours_activities', tier: 'starter',
    amount: 99900,   interval: 'monthly', initial_credits: 400,
    features: { staff_users: 1, campaigns: false, slot_inventory: true, group_booking: false } },
  { plan_id: 'tour_growth_m',  name: 'Growth',            business_type: 'tours_activities', tier: 'growth',
    amount: 199900,  interval: 'monthly', initial_credits: 1000,
    features: { staff_users: 3, campaigns: true,  slot_inventory: true, group_booking: true } },
  { plan_id: 'tour_pro_m',     name: 'Pro',               business_type: 'tours_activities', tier: 'pro',
    amount: 399900,  interval: 'monthly', initial_credits: 3000,
    features: { staff_users: -1, campaigns: true, slot_inventory: true, group_booking: true, analytics: true } },
  { plan_id: 'tour_starter_y', name: 'Starter (Annual)',  business_type: 'tours_activities', tier: 'starter',
    amount: 999000,  interval: 'yearly',  initial_credits: 5500,
    features: { staff_users: 1, campaigns: false, slot_inventory: true, group_booking: false } },
  { plan_id: 'tour_growth_y',  name: 'Growth (Annual)',   business_type: 'tours_activities', tier: 'growth',
    amount: 1999000, interval: 'yearly',  initial_credits: 14000,
    features: { staff_users: 3, campaigns: true,  slot_inventory: true, group_booking: true } },
  { plan_id: 'tour_pro_y',     name: 'Pro (Annual)',      business_type: 'tours_activities', tier: 'pro',
    amount: 3999000, interval: 'yearly',  initial_credits: 42000,
    features: { staff_users: -1, campaigns: true, slot_inventory: true, group_booking: true, analytics: true } },

  // ── PRODUCTS ───────────────────────────────────────────────────────────────
  { plan_id: 'prod_starter_m', name: 'Starter',           business_type: 'products', tier: 'starter',
    amount: 99900,   interval: 'monthly', initial_credits: 300,
    features: { staff_users: 1, campaigns: false, catalog_size: 50,  order_tracking: false } },
  { plan_id: 'prod_growth_m',  name: 'Business',          business_type: 'products', tier: 'growth',
    amount: 249900,  interval: 'monthly', initial_credits: 1000,
    features: { staff_users: 2, campaigns: true,  catalog_size: 500, order_tracking: true } },
  { plan_id: 'prod_pro_m',     name: 'Pro',               business_type: 'products', tier: 'pro',
    amount: 499900,  interval: 'monthly', initial_credits: 3500,
    features: { staff_users: -1, campaigns: true, catalog_size: -1,  order_tracking: true, analytics: true } },
  { plan_id: 'prod_starter_y', name: 'Starter (Annual)',  business_type: 'products', tier: 'starter',
    amount: 999000,  interval: 'yearly',  initial_credits: 4200,
    features: { staff_users: 1, campaigns: false, catalog_size: 50,  order_tracking: false } },
  { plan_id: 'prod_growth_y',  name: 'Business (Annual)', business_type: 'products', tier: 'growth',
    amount: 2499000, interval: 'yearly',  initial_credits: 14000,
    features: { staff_users: 2, campaigns: true,  catalog_size: 500, order_tracking: true } },
  { plan_id: 'prod_pro_y',     name: 'Pro (Annual)',      business_type: 'products', tier: 'pro',
    amount: 4999000, interval: 'yearly',  initial_credits: 50000,
    features: { staff_users: -1, campaigns: true, catalog_size: -1,  order_tracking: true, analytics: true } },

  // ── SERVICES ───────────────────────────────────────────────────────────────
  { plan_id: 'svc_starter_m',  name: 'Starter',           business_type: 'services', tier: 'starter',
    amount: 79900,   interval: 'monthly', initial_credits: 250,
    features: { staff_users: 1, campaigns: false, appointment_booking: true, service_catalog: 10 } },
  { plan_id: 'svc_growth_m',   name: 'Business',          business_type: 'services', tier: 'growth',
    amount: 199900,  interval: 'monthly', initial_credits: 800,
    features: { staff_users: 3, campaigns: true,  appointment_booking: true, service_catalog: 50 } },
  { plan_id: 'svc_pro_m',      name: 'Pro',               business_type: 'services', tier: 'pro',
    amount: 349900,  interval: 'monthly', initial_credits: 2500,
    features: { staff_users: -1, campaigns: true, appointment_booking: true, service_catalog: -1, analytics: true } },
  { plan_id: 'svc_starter_y',  name: 'Starter (Annual)',  business_type: 'services', tier: 'starter',
    amount: 799000,  interval: 'yearly',  initial_credits: 3500,
    features: { staff_users: 1, campaigns: false, appointment_booking: true, service_catalog: 10 } },
  { plan_id: 'svc_growth_y',   name: 'Business (Annual)', business_type: 'services', tier: 'growth',
    amount: 1999000, interval: 'yearly',  initial_credits: 11000,
    features: { staff_users: 3, campaigns: true,  appointment_booking: true, service_catalog: 50 } },
  { plan_id: 'svc_pro_y',      name: 'Pro (Annual)',      business_type: 'services', tier: 'pro',
    amount: 3499000, interval: 'yearly',  initial_credits: 35000,
    features: { staff_users: -1, campaigns: true, appointment_booking: true, service_catalog: -1, analytics: true } },
];

const CREDIT_PRICING = [
  { action_type: 'marketing_conversation', cost: 1.5000, description: 'Campaign / promo WhatsApp message (24h window)' },
  { action_type: 'utility_conversation',   cost: 0.8000, description: 'Booking confirmation, reminder, order update' },
  { action_type: 'service_conversation',   cost: 0.5000, description: 'Customer-initiated inbound conversation' },
  { action_type: 'flow_session',           cost: 2.0000, description: 'WhatsApp Flow opened by customer' },
  { action_type: 'template_send',          cost: 0.8000, description: 'Standalone template outside a campaign' },
  { action_type: 'campaign_recipient',     cost: 1.5000, description: 'Per recipient in a broadcast campaign' },
];

async function main() {
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
    console.log('Seeding billing_plans...');
    let inserted = 0, skipped = 0;
    for (const p of PLANS) {
      const exists = await sql.unsafe(
        `SELECT 1 FROM billing_plans WHERE plan_id='${p.plan_id}' LIMIT 1`,
      );
      if (exists.length) { skipped++; continue; }
      await sql.unsafe(
        `INSERT INTO billing_plans (plan_id, name, business_type, tier, amount, interval, interval_count, initial_credits, features)
         VALUES ('${p.plan_id}', '${p.name}', '${p.business_type}', '${p.tier}', ${p.amount}, '${p.interval}', 1, ${p.initial_credits}, '${JSON.stringify(p.features)}'::jsonb)`,
      );
      inserted++;
      console.log(`  ✓ ${p.plan_id}`);
    }
    console.log(`  Plans: ${inserted} inserted, ${skipped} already existed\n`);

    console.log('Seeding credit_pricing...');
    inserted = 0; skipped = 0;
    for (const c of CREDIT_PRICING) {
      await sql.unsafe(
        `INSERT INTO credit_pricing (action_type, cost, description)
         VALUES ('${c.action_type}', ${c.cost}, '${c.description}')
         ON CONFLICT (action_type) DO UPDATE SET cost = EXCLUDED.cost, description = EXCLUDED.description, updated_at = NOW()`,
      );
      inserted++;
      console.log(`  ✓ ${c.action_type} → ₹${c.cost}`);
    }
    console.log(`  Credit pricing: ${inserted} upserted\n`);

    console.log('Seeding complete!');
    await sql.end();
  } catch (err) {
    await sql.end().catch(() => {});
    console.error('FATAL:', err.message);
    process.exit(1);
  }
}

main();
