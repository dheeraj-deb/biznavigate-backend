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
    // Show columns
    const cols = await sql.unsafe(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'roles' ORDER BY ordinal_position
    `);
    console.log('Columns:', cols.map(c => `${c.column_name}(${c.data_type})`).join(', '));

    // Show raw data
    const raw = await sql.unsafe('SELECT * FROM roles');
    console.log('Raw:', JSON.stringify(raw, null, 2));
  } finally {
    await sql.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
