// Seed dummy analytics data — uses inline SQL (no params) to avoid PgCat extended-protocol issues
const postgres = require('postgres');
require('dotenv').config();

const BUSINESS_ID = '619117e5-62f6-4170-a9e0-8ab985791181';
const TENANT_ID   = 'c797d8b8-e463-4b20-afd8-d1d2182fc3e6';

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.delete('pgbouncer');
  url.searchParams.delete('statement_cache_size');
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  const sql = postgres(url.toString(), {
    prepare: false, ssl: 'require', idle_timeout: 10,
    connection: { search_path: schema },
  });

  const q = (str) => sql.unsafe(str);

  try {
    // ── 1. Catalog Items ──────────────────────────────────────────────────────
    console.log('Seeding catalog items...');
    const itemDefs = [
      { name: 'Premium Hoodie',  category: 'Apparel',     base_price: 1299, stock: 80  },
      { name: 'Slim Fit Jeans',  category: 'Apparel',     base_price: 999,  stock: 120 },
      { name: 'Wireless Earbuds',category: 'Electronics', base_price: 2499, stock: 45  },
      { name: 'Leather Wallet',  category: 'Accessories', base_price: 599,  stock: 200 },
      { name: 'Yoga Mat',        category: 'Fitness',     base_price: 799,  stock: 60  },
      { name: 'Sneakers Pro',    category: 'Footwear',    base_price: 3499, stock: 30  },
      { name: 'Backpack XL',     category: 'Bags',        base_price: 1799, stock: 55  },
      { name: 'Smart Watch',     category: 'Electronics', base_price: 4999, stock: 8   },
    ];

    const itemIds = [];
    for (const item of itemDefs) {
      const existing = await q(`SELECT item_id FROM catalog_items WHERE business_id=${esc(BUSINESS_ID)} AND name=${esc(item.name)} LIMIT 1`);
      if (existing.length > 0) {
        itemIds.push({ id: existing[0].item_id, price: item.base_price, name: item.name });
        console.log(`  exists: ${item.name}`);
        continue;
      }
      const r = await q(
        `INSERT INTO catalog_items (business_id,tenant_id,item_type,name,category,base_price,is_active,stock_quantity,created_at,updated_at)
         VALUES (${esc(BUSINESS_ID)},${esc(TENANT_ID)},'physical_product',${esc(item.name)},${esc(item.category)},${item.base_price},true,${item.stock},NOW(),NOW())
         RETURNING item_id`
      );
      itemIds.push({ id: r[0].item_id, price: item.base_price, name: item.name });
      console.log(`  created: ${item.name}`);
    }

    // ── 2. Customers ──────────────────────────────────────────────────────────
    console.log('Seeding customers...');
    const customerDefs = [
      { name: 'Rahul Sharma',  phone: '+919876543001', email: 'rahul@example.com',  createdDays: 60 },
      { name: 'Priya Singh',   phone: '+919876543002', email: 'priya@example.com',  createdDays: 55 },
      { name: 'Amit Verma',    phone: '+919876543003', email: 'amit@example.com',   createdDays: 45 },
      { name: 'Sneha Patel',   phone: '+919876543004', email: 'sneha@example.com',  createdDays: 40 },
      { name: 'Rohan Gupta',   phone: '+919876543005', email: 'rohan@example.com',  createdDays: 30 },
      { name: 'Divya Nair',    phone: '+919876543006', email: 'divya@example.com',  createdDays: 25 },
      { name: 'Karan Mehta',   phone: '+919876543007', email: 'karan@example.com',  createdDays: 20 },
      { name: 'Ananya Reddy',  phone: '+919876543008', email: 'ananya@example.com', createdDays: 15 },
      { name: 'Vikram Joshi',  phone: '+919876543009', email: 'vikram@example.com', createdDays: 10 },
      { name: 'Pooja Iyer',    phone: '+919876543010', email: 'pooja@example.com',  createdDays: 5  },
    ];

    const customerIds = [];
    for (const c of customerDefs) {
      const existing = await q(`SELECT customer_id FROM customers WHERE business_id=${esc(BUSINESS_ID)} AND phone=${esc(c.phone)} LIMIT 1`);
      if (existing.length > 0) {
        customerIds.push(existing[0].customer_id);
        continue;
      }
      const ts = daysAgo(c.createdDays);
      const r = await q(
        `INSERT INTO customers (business_id,tenant_id,name,phone,email,total_orders,total_spent,engagement_score,created_at,updated_at)
         VALUES (${esc(BUSINESS_ID)},${esc(TENANT_ID)},${esc(c.name)},${esc(c.phone)},${esc(c.email)},0,0,70,${esc(ts)},${esc(ts)})
         RETURNING customer_id`
      );
      customerIds.push(r[0].customer_id);
    }
    console.log(`  ${customerIds.length} customers ready`);

    // ── 3. Orders + Order Items ───────────────────────────────────────────────
    console.log('Seeding orders...');

    // Check how many orders already exist
    const existingOrders = await q(`SELECT COUNT(*) as n FROM orders WHERE business_id=${esc(BUSINESS_ID)}`);
    if (Number(existingOrders[0].n) >= 30) {
      console.log(`  already have ${existingOrders[0].n} orders, skipping`);
    } else {
      const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
      let ordersCreated = 0;

      // 40 orders spread over last 30 days
      const orderPlan = [];
      for (let i = 0; i < 40; i++) {
        const daysBack = Math.floor(Math.random() * 30);
        const custIdx  = i % customerIds.length;
        const statusIdx = Math.floor(Math.random() * orderStatuses.length);
        const numItems  = Math.floor(Math.random() * 3) + 1;
        const shuffled  = [...itemIds].sort(() => Math.random() - 0.5).slice(0, numItems);
        orderPlan.push({ daysBack, custIdx, statusIdx, items: shuffled });
      }

      for (const plan of orderPlan) {
        const createdAt  = daysAgo(plan.daysBack);
        const customerId = customerIds[plan.custIdx];
        const status     = orderStatuses[plan.statusIdx];

        let total = 0;
        const lineItems = plan.items.map((item) => {
          const qty = Math.floor(Math.random() * 3) + 1;
          total += item.price * qty;
          return { item, qty };
        });

        const orderR = await q(
          `INSERT INTO orders (business_id,tenant_id,customer_id,order_type,total_amount,status,payment_status,source,created_at,updated_at)
           VALUES (${esc(BUSINESS_ID)},${esc(TENANT_ID)},${esc(customerId)},'product',${total},${esc(status)},'paid','whatsapp',${esc(createdAt)},${esc(createdAt)})
           RETURNING order_id`
        );
        const orderId = orderR[0].order_id;

        for (const { item, qty } of lineItems) {
          await q(
            `INSERT INTO order_items (order_id,item_id,product_name,quantity,unit_price,total_price,created_at,updated_at)
             VALUES (${esc(orderId)},${esc(item.id)},${esc(item.name)},${qty},${item.price},${item.price * qty},${esc(createdAt)},${esc(createdAt)})`
          );
        }
        ordersCreated++;
      }
      console.log(`  ${ordersCreated} orders created`);
    }

    // ── 4. Lead Funnel ────────────────────────────────────────────────────────
    console.log('Seeding lead funnel...');
    const leadPlan = [
      { status: 'new',    count: 12 },
      { status: 'active', count: 8  },
      { status: 'quoted', count: 5  },
      { status: 'booked', count: 4  },
      { status: 'won',    count: 7  },
      { status: 'lost',   count: 3  },
    ];
    for (const { status, count } of leadPlan) {
      const existing = await q(`SELECT COUNT(*) as n FROM leads WHERE business_id=${esc(BUSINESS_ID)} AND status=${esc(status)} AND deleted_at IS NULL`);
      const have = Number(existing[0].n);
      const need = count - have;
      for (let i = 0; i < need; i++) {
        await q(`INSERT INTO leads (business_id,tenant_id,channel,source,status,created_at,updated_at) VALUES (${esc(BUSINESS_ID)},${esc(TENANT_ID)},'whatsapp','whatsapp',${esc(status)},NOW(),NOW())`);
      }
    }
    console.log(`  lead funnel seeded`);

    console.log('\nAll analytics data seeded successfully!');
  } finally {
    await sql.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
