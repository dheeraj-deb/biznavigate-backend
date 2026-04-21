// Seed rich leads dummy data
// Uses sql.begin() to lock to one PgCat backend and avoid stale prepared-statement issues.
const postgres = require('postgres');
const crypto   = require('crypto');
require('dotenv').config();

const BUSINESS_ID = '619117e5-62f6-4170-a9e0-8ab985791181';
const TENANT_ID   = 'c797d8b8-e463-4b20-afd8-d1d2182fc3e6';
const BUSINESS_ID_2 = 'ed8fff80-3310-4551-a8a6-0e34ecf62af4';
const TENANT_ID_2   = '47e74d6a-064a-4a76-b0ab-b52ef5d75610';

const uuid = () => crypto.randomUUID();

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return isFinite(v) ? String(v) : 'NULL';
  if (typeof v === 'object') return "'" + JSON.stringify(v).replace(/'/g, "''") + "'";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function hoursFromNow(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

const LEADS = [
  { name: 'Arjun Kapoor',  phone: '+919876501001', email: 'arjun@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'quoted',  daysBack: 2,
    quoted_amount: 15000,
    ctx: { type: 'resort', check_in: '2026-05-01', check_out: '2026-05-04', nights: 3, guests: 2, room_pref: 'deluxe', budget: 15000 } },

  { name: 'Meera Joshi',   phone: '+919876501002', email: 'meera@example.com',
    channel: 'whatsapp', source: 'instagram', status: 'active',  daysBack: 1,
    ctx: { type: 'resort', check_in: '2026-05-10', check_out: '2026-05-12', nights: 2, guests: 4, room_pref: 'suite', budget: 25000 } },

  { name: 'Suresh Nair',   phone: '+919876501003', email: 'suresh@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'won',     daysBack: 8,
    quoted_amount: 8500, converted_value: 8500,
    ctx: { type: 'camp', event: 'Trekking', date: '2026-04-28', date_is_fixed: true, group_size: 6, package: 'standard', food_pref: 'veg' } },

  { name: 'Priyanka Das',  phone: '+919876501004', email: 'priyanka@example.com',
    channel: 'website',  source: 'google',    status: 'new',     daysBack: 0,
    ctx: { type: 'product', items: [{ name: 'Wireless Earbuds', qty: 2, price: 2499 }], pincode: '400001' } },

  { name: 'Rohit Sharma',  phone: '+919876501005', email: 'rohit@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'booked',  daysBack: 5,
    quoted_amount: 22000, converted_value: 22000,
    ctx: { type: 'resort', check_in: '2026-05-15', check_out: '2026-05-18', nights: 3, guests: 2, room_pref: 'premium', budget: 22000 } },

  { name: 'Kavya Menon',   phone: '+919876501006', email: 'kavya@example.com',
    channel: 'whatsapp', source: 'instagram', status: 'new',     daysBack: 0,
    ctx: { type: 'camp', event: 'Bonfire Night', date: '2026-05-05', date_is_fixed: false, group_size: 10, food_pref: 'non-veg' } },

  { name: 'Deepak Verma',  phone: '+919876501007', email: 'deepak@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'lost',    daysBack: 12,
    quoted_amount: 18000, lost_reason: 'price',
    ctx: { type: 'resort', check_in: '2026-04-20', check_out: '2026-04-23', nights: 3, guests: 2 } },

  { name: 'Anita Pillai',  phone: '+919876501008', email: 'anita@example.com',
    channel: 'website',  source: 'google',    status: 'active',  daysBack: 3,
    ctx: { type: 'product', items: [{ name: 'Smart Watch', qty: 1, price: 4999 }, { name: 'Leather Wallet', qty: 1, price: 599 }], pincode: '560001' } },

  { name: 'Vikash Singh',  phone: '+919876501009', email: 'vikash@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'quoted',  daysBack: 4,
    quoted_amount: 32000,
    ctx: { type: 'resort', check_in: '2026-06-01', check_out: '2026-06-05', nights: 4, guests: 6, room_pref: 'cottage', budget: 32000 } },

  { name: 'Swati Agarwal', phone: '+919876501010', email: 'swati@example.com',
    channel: 'whatsapp', source: 'instagram', status: 'won',     daysBack: 15,
    quoted_amount: 5500, converted_value: 5500,
    ctx: { type: 'camp', event: 'Yoga Retreat', date: '2026-04-12', date_is_fixed: true, group_size: 4, food_pref: 'veg' } },

  { name: 'Nikhil Bose',   phone: '+919876501011', email: 'nikhil@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'new',     daysBack: 0, ctx: null },

  { name: 'Ritu Chauhan',  phone: '+919876501012', email: 'ritu@example.com',
    channel: 'website',  source: 'google',    status: 'active',  daysBack: 2,
    ctx: { type: 'product', items: [{ name: 'Yoga Mat', qty: 1, price: 799 }, { name: 'Sneakers Pro', qty: 1, price: 3499 }], pincode: '110001' } },

  { name: 'Aakash Tiwari', phone: '+919876501013', email: 'aakash@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'quoted',  daysBack: 3,
    quoted_amount: 12000,
    ctx: { type: 'camp', event: 'Team Outing', date: '2026-05-20', date_is_fixed: true, group_size: 15, package: 'premium', food_pref: 'both' } },

  { name: 'Pooja Desai',   phone: '+919876501014', email: 'pooja@example.com',
    channel: 'whatsapp', source: 'instagram', status: 'booked',  daysBack: 7,
    quoted_amount: 9800, converted_value: 9800,
    ctx: { type: 'resort', check_in: '2026-05-25', check_out: '2026-05-27', nights: 2, guests: 2, room_pref: 'deluxe' } },

  { name: 'Harish Kumar',  phone: '+919876501015', email: 'harish@example.com',
    channel: 'whatsapp', source: 'direct',    status: 'new',     daysBack: 0,
    ctx: { type: 'product', items: [{ name: 'Backpack XL', qty: 2, price: 1799 }], pincode: '380001' } },
];

async function seedForBusiness(tx, businessId, tenantId) {
  console.log('\nSeeding leads for business ' + businessId.slice(0, 8) + '...');

  const existingRows = await tx.unsafe("SELECT COUNT(*) as n FROM leads WHERE business_id='" + businessId + "' AND phone LIKE '+9198765010%'");
  if (Number(existingRows[0].n) >= 10) {
    console.log('  Already have ' + existingRows[0].n + ' rich leads, skipping');
    return;
  }

  const users = await tx.unsafe("SELECT user_id FROM users WHERE business_id='" + businessId + "' LIMIT 1");
  const userId = users.length > 0 ? users[0].user_id : null;
  console.log('  User for followups: ' + (userId ? userId.slice(0, 8) + '...' : 'none'));

  let leadsCreated = 0, eventsCreated = 0, followupsCreated = 0;

  for (const def of LEADS) {
    const dup = await tx.unsafe("SELECT lead_id FROM leads WHERE business_id='" + businessId + "' AND phone=" + esc(def.phone) + " LIMIT 1");
    if (dup.length > 0) { console.log('  exists: ' + def.name); continue; }

    const leadId    = uuid();
    const createdAt = daysAgo(def.daysBack);
    const quotedAt  = def.quoted_amount  ? daysAgo(Math.max(0, def.daysBack - 1)) : null;
    const convertAt = def.converted_value ? daysAgo(Math.max(0, def.daysBack - 2)) : null;

    const insertSql = [
      "INSERT INTO leads",
      "(lead_id, business_id, tenant_id, name, phone, email, channel, source,",
      " platform_id, status, lost_reason, context, quoted_amount, quoted_at,",
      " converted_value, converted_at, tags, created_at, updated_at)",
      "VALUES",
      "(",
      "'" + leadId + "',",
      "'" + businessId + "',",
      "'" + tenantId + "',",
      esc(def.name) + ",",
      esc(def.phone) + ",",
      esc(def.email) + ",",
      esc(def.channel) + ",",
      esc(def.source) + ",",
      "NULL,",
      esc(def.status) + ",",
      esc(def.lost_reason || null) + ",",
      esc(def.ctx) + ",",
      (def.quoted_amount   ? def.quoted_amount   : "NULL") + ",",
      (quotedAt            ? esc(quotedAt)        : "NULL") + ",",
      (def.converted_value ? def.converted_value  : "NULL") + ",",
      (convertAt           ? esc(convertAt)       : "NULL") + ",",
      "'{}'::text[],",
      esc(createdAt) + ",",
      esc(createdAt),
      ")",
    ].join('\n');

    try {
      await tx.unsafe(insertSql);
    } catch (e) {
      console.error('SQL ERROR for ' + def.name + ':', e.message);
      console.error('SQL:', insertSql.slice(0, 400));
      throw e;
    }
    leadsCreated++;

    // status_changed event
    await tx.unsafe([
      "INSERT INTO lead_events (event_id, lead_id, business_id, type, actor, data, created_at)",
      "VALUES",
      "('" + uuid() + "','" + leadId + "','" + businessId + "','status_changed','ai',",
      "'{\"from\":\"new\",\"to\":\"" + def.status + "\"}'," + esc(createdAt) + ")",
    ].join(' '));
    eventsCreated++;

    // note for hot leads
    if (['quoted', 'won', 'booked'].includes(def.status)) {
      await tx.unsafe([
        "INSERT INTO lead_events (event_id, lead_id, business_id, type, actor, data, created_at)",
        "VALUES",
        "('" + uuid() + "','" + leadId + "','" + businessId + "','note','human',",
        "'{\"text\":\"Follow up with customer about the quote\"}'," + esc(daysAgo(Math.max(0, def.daysBack - 0.3))) + ")",
      ].join(' '));
      eventsCreated++;
    }

    // demand_miss for resort/camp
    if (def.ctx && (def.ctx.type === 'camp' || def.ctx.type === 'resort')) {
      const svcName = def.ctx.type === 'resort' ? 'Pool View Room' : 'Photography Package';
      const demandData = JSON.stringify({ service_name: svcName, service_id: null }).replace(/'/g, "''");
      await tx.unsafe([
        "INSERT INTO lead_events (event_id, lead_id, business_id, type, actor, data, created_at)",
        "VALUES",
        "('" + uuid() + "','" + leadId + "','" + businessId + "','demand_miss','ai',",
        "'" + demandData + "'," + esc(createdAt) + ")",
      ].join(' '));
      eventsCreated++;
    }

    // follow-up for new/active/quoted (needs valid user)
    if (userId && ['new', 'active', 'quoted'].includes(def.status)) {
      const scheduledAt = hoursFromNow(24 + Math.floor(Math.random() * 48));
      const fupNote = 'Call back regarding ' + (def.ctx ? def.ctx.type : 'enquiry');
      await tx.unsafe([
        "INSERT INTO lead_followups",
        "(followup_id, lead_id, business_id, note, scheduled_at, assigned_to, done, created_by, created_at)",
        "VALUES",
        "('" + uuid() + "','" + leadId + "','" + businessId + "',",
        esc(fupNote) + "," + esc(scheduledAt) + ",",
        "'" + userId + "',FALSE,'" + userId + "'," + esc(createdAt) + ")",
      ].join('\n'));
      followupsCreated++;
    }

    console.log('  created: ' + def.name + ' (' + def.status + ')');
  }

  console.log('  Done: ' + leadsCreated + ' leads, ' + eventsCreated + ' events, ' + followupsCreated + ' followups');
}

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.delete('pgbouncer');
  url.searchParams.delete('statement_cache_size');
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');
  const connStr = url.toString();

  const MAX_ATTEMPTS = 8;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const sql = postgres(connStr, {
      prepare: false, ssl: 'require', idle_timeout: 30,
      connection: { search_path: schema },
      max: 1,
    });
    try {
      // Discover all businesses; seed those with fewer than 10 leads
      const businesses = await sql.unsafe(
        "SELECT b.business_id, b.tenant_id FROM businesses b " +
        "LEFT JOIN leads l ON l.business_id = b.business_id AND l.phone LIKE '+9198765010%' " +
        "GROUP BY b.business_id, b.tenant_id HAVING COUNT(l.lead_id) < 10"
      );

      if (businesses.length === 0) {
        console.log('All businesses already have seed leads. Nothing to do.');
        await sql.end();
        return;
      }

      await sql.begin(async (tx) => {
        for (const biz of businesses) {
          await seedForBusiness(tx, biz.business_id, biz.tenant_id);
        }
      });
      console.log('\nAll leads seeded successfully!');
      await sql.end();
      return;
    } catch (e) {
      await sql.end().catch(() => {});
      if (e?.code === '26000' && attempt < MAX_ATTEMPTS) {
        console.log('  [attempt ' + attempt + '] PgCat stale backend, retrying...');
        continue;
      }
      throw e;
    }
  }
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
