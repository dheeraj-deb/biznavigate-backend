const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function findMapping() {
  try {
    console.log('=== ALL INTENTS ===\n');
    const intents = await prisma.intents.findMany();
    intents.forEach(i => console.log(`- ${i.intent_name} (${i.intent_id})`));

    console.log('\n=== WORKFLOWS WITH "ORDER" ===\n');
    const workflows = await prisma.workflow_definitions.findMany({
      where: {
        OR: [
          { workflow_name: { contains: 'order', mode: 'insensitive' } },
          { workflow_key: { contains: 'order', mode: 'insensitive' } },
        ],
      },
    });
    workflows.forEach(w => console.log(`- ${w.workflow_name} (${w.workflow_key}) - ID: ${w.workflow_id}`));

    console.log('\n=== BUSINESS WORKFLOW MAPPINGS ===\n');
    const mappings = await prisma.business_workflows.findMany({
      where: {
        workflow_id: { in: workflows.map(w => w.workflow_id) },
      },
    });

    for (const mapping of mappings) {
      const intent = await prisma.intents.findUnique({
        where: { intent_id: mapping.intent_id },
      });
      const workflow = workflows.find(w => w.workflow_id === mapping.workflow_id);
      console.log(`Intent: ${intent?.intent_name} → Workflow: ${workflow?.workflow_name}`);
      console.log(`  Business: ${mapping.business_id}, Active: ${mapping.is_active}\n`);
    }

    if (mappings.length === 0) {
      console.log('⚠️  NO MAPPINGS FOUND! The order-processing workflow is not connected to any intent.\n');
      console.log('This is why the workflow is not executing. You need to create a business_workflow mapping.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findMapping();
