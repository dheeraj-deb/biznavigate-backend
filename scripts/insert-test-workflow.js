const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`
      INSERT INTO workflow_definitions (
          workflow_id,
          workflow_key,
          workflow_name,
          version,
          business_type,
          intent_name,
          workflow_definition,
          description,
          is_active,
          created_at,
          updated_at
      ) VALUES (
          '00000000-0000-0000-0000-000000000001'::uuid,
          'test_workflow',
          'Test Workflow',
          '1.0.0',
          'general',
          'GENERAL_INQUIRY',
          '{
              "id": "00000000-0000-0000-0000-000000000001",
              "name": "Test Workflow",
              "active": true,
              "nodes": [],
              "connections": {}
          }'::jsonb,
          'General inquiry and purchase intent workflow for WhatsApp',
          true,
          NOW(),
          NOW()
      )
      ON CONFLICT (workflow_id) DO UPDATE SET
          workflow_name = EXCLUDED.workflow_name,
          workflow_definition = EXCLUDED.workflow_definition,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          updated_at = NOW();
    `;
    console.log('✅ Test workflow inserted/updated successfully');
  } catch (error) {
    console.error('❌ Error inserting workflow:', error.message);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
