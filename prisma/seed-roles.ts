import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const ROLES = [
  {
    role_name: 'Administrator',
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    role_name: 'Manager',
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
  },
  {
    role_name: 'Editor',
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
  },
  {
    role_name: 'Viewer',
    permissions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
  },
];

async function main() {
  console.log('Seeding roles...');

  for (const role of ROLES) {
    const existing = await prisma.roles.findUnique({ where: { role_name: role.role_name } });

    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${role.role_name}`);
      continue;
    }

    const created = await prisma.roles.create({ data: role });
    console.log(`  ✅ Created: ${created.role_name} (${created.role_id})`);
  }

  console.log('\nRoles in DB:');
  const all = await prisma.roles.findMany({ orderBy: { role_name: 'asc' } });
  all.forEach(r => {
    const perms = r.permissions as Record<string, boolean>;
    const permStr = Object.entries(perms ?? {})
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ');
    console.log(`  ${r.role_name.padEnd(16)} — ${permStr} (${r.role_id})`);
  });
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
