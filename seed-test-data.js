// Seed Test Data for BizNavigate Lead Management
const { PrismaClient } = require('./generated/prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  try {
    // 1. Create Test Tenant
    console.log('Creating test tenant...');
    const tenant = await prisma.tenants.upsert({
      where: { tenant_id: '11111111-1111-1111-1111-111111111111' },
      update: {},
      create: {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        tenant_name: 'Test Tenant Inc',
        email: 'admin@testtenant.com',
        phone_number: '9999999999',
      },
    });
    console.log('✓ Tenant created:', tenant.tenant_name);

    // 2. Create Subscription Plan
    console.log('\nCreating subscription plan...');
    const plan = await prisma.subscription_plans.upsert({
      where: { subscription_plan_id: '22222222-2222-2222-2222-222222222222' },
      update: {},
      create: {
        subscription_plan_id: '22222222-2222-2222-2222-222222222222',
        plan_name: 'Premium Plan',
        price: 9999.00,
        duration_in_days: 365,
      },
    });
    console.log('✓ Plan created:', plan.plan_name);

    // 3. Create Test Business
    console.log('\nCreating test business...');
    const business = await prisma.businesses.upsert({
      where: { business_id: '33333333-3333-3333-3333-333333333333' },
      update: {},
      create: {
        business_id: '33333333-3333-3333-3333-333333333333',
        tenant_id: '11111111-1111-1111-1111-111111111111',
        business_name: 'Test Business Ltd',
        business_type: 'Retail',
        subscription_plan_id: '22222222-2222-2222-2222-222222222222',
        whatsapp_number: '9876543210',
      },
    });
    console.log('✓ Business created:', business.business_name);

    // 4. Create Test Role
    console.log('\nCreating test role...');
    const role = await prisma.roles.upsert({
      where: { role_id: '44444444-4444-4444-4444-444444444444' },
      update: {},
      create: {
        role_id: '44444444-4444-4444-4444-444444444444',
        role_name: 'Sales Agent',
        permissions: { can_view_leads: true, can_edit_leads: true },
      },
    });
    console.log('✓ Role created:', role.role_name);

    // 5. Create Test Users (Agents)
    console.log('\nCreating test users...');
    const agent1 = await prisma.users.upsert({
      where: { user_id: '55555555-5555-5555-5555-555555555555' },
      update: {},
      create: {
        user_id: '55555555-5555-5555-5555-555555555555',
        business_id: '33333333-3333-3333-3333-333333333333',
        email: 'agent1@test.com',
        name: 'John Agent',
        is_active: true,
        role_id: '44444444-4444-4444-4444-444444444444',
      },
    });
    console.log('✓ User created:', agent1.name);

    const agent2 = await prisma.users.upsert({
      where: { user_id: '66666666-6666-6666-6666-666666666666' },
      update: {},
      create: {
        user_id: '66666666-6666-6666-6666-666666666666',
        business_id: '33333333-3333-3333-3333-333333333333',
        email: 'agent2@test.com',
        name: 'Jane Agent',
        is_active: true,
        role_id: '44444444-4444-4444-4444-444444444444',
      },
    });
    console.log('✓ User created:', agent2.name);

    // 6. Create Test Tags
    console.log('\nCreating test tags...');
    const tag1 = await prisma.tags.upsert({
      where: { tag_id: '77777777-7777-7777-7777-777777777777' },
      update: {},
      create: {
        tag_id: '77777777-7777-7777-7777-777777777777',
        business_id: '33333333-3333-3333-3333-333333333333',
        tenant_id: '11111111-1111-1111-1111-111111111111',
        tag_name: 'VIP',
        tag_category: 'priority',
        tag_color: '#FFD700',
        is_system: false,
      },
    });
    console.log('✓ Tag created:', tag1.tag_name);

    const tag2 = await prisma.tags.upsert({
      where: { tag_id: '88888888-8888-8888-8888-888888888888' },
      update: {},
      create: {
        tag_id: '88888888-8888-8888-8888-888888888888',
        business_id: '33333333-3333-3333-3333-333333333333',
        tenant_id: '11111111-1111-1111-1111-111111111111',
        tag_name: 'Urgent',
        tag_category: 'priority',
        tag_color: '#FF0000',
        is_system: false,
      },
    });
    console.log('✓ Tag created:', tag2.tag_name);

    console.log('\n✅ Test data seeded successfully!\n');
    console.log('📝 Use these IDs for testing:');
    console.log('  Tenant ID:   11111111-1111-1111-1111-111111111111');
    console.log('  Business ID: 33333333-3333-3333-3333-333333333333');
    console.log('  Agent 1 ID:  55555555-5555-5555-5555-555555555555');
    console.log('  Agent 2 ID:  66666666-6666-6666-6666-666666666666');
    console.log('  Tag VIP ID:  77777777-7777-7777-7777-777777777777');
    console.log('  Tag Urgent:  88888888-8888-8888-8888-888888888888\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData()
  .then(() => {
    console.log('Done! 🎉');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
