// Minimal role seeder using postgres.js directly (avoids PgCat prepared statement issues)
const postgres = require('postgres');
require('dotenv').config();

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.delete('pgbouncer');
  url.searchParams.delete('statement_cache_size');
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  const sql = postgres(url.toString(), {
    prepare: false,
    ssl: 'require',
    idle_timeout: 10,
    connection: { search_path: schema },
  });

  try {
    // Check existing roles
    const existing = await sql.unsafe('SELECT role_name FROM roles');
    console.log('Existing roles:', existing.map(r => r.role_name));

    if (existing.length > 0) {
      console.log('Roles already exist, skipping seed.');
      return;
    }

    // Insert roles
    const roles = [
      { role_name: 'Administrator', permissions: { view: true, create: true, edit: true, delete: true } },
      { role_name: 'Manager',       permissions: { view: true, create: true, edit: true, delete: false } },
      { role_name: 'Viewer',        permissions: { view: true, create: false, edit: false, delete: false } },
    ];

    for (const role of roles) {
      const result = await sql.unsafe(
        `INSERT INTO roles (role_name, permissions, created_at, updated_at)
         VALUES ($1, $2::jsonb, NOW(), NOW())
         RETURNING role_id, role_name`,
        [role.role_name, JSON.stringify(role.permissions)]
      );
      console.log(`Created role: ${result[0].role_name} (${result[0].role_id})`);
    }

    console.log('Roles seeded successfully!');
  } finally {
    await sql.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
