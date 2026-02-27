const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function checkIntentMapping() {
  try {
    // Find ORDER_REQUEST intent
    const intent = await prisma.intents.findFirst({
      where: { intent_name: 'ORDER_REQUEST' },
    });

    if (!intent) {
      console.log('ORDER_REQUEST intent not found');
      return;
    }

    console.log(`Intent: ${intent.intent_name}`);
    console.log(`Description: ${intent.description}\n`);

    // Find business workflows mapped to this intent
    const businessWorkflows = await prisma.business_workflows.findMany({
      where: { intent_id: intent.intent_id },
      include: {
        workflow_definitions: true,
      },
    });

    console.log(`Found ${businessWorkflows.length} business workflow(s) mapped to ORDER_REQUEST:\n`);

    businessWorkflows.forEach((bw, i) => {
      console.log(`${i + 1}. Business Workflow ${bw.business_workflow_id.substring(0, 8)}`);
      console.log(`   Workflow: ${bw.workflow_definitions.workflow_name}`);
      console.log(`   Workflow Key: ${bw.workflow_definitions.workflow_key}`);
      console.log(`   Business ID: ${bw.business_id}`);
      console.log(`   Active: ${bw.is_active}`);
      console.log('');
    });

    // Also check all workflows with 'order' in the name
    console.log('\nAll workflows with "order" in name/key:');
    const allWorkflows = await prisma.workflow_definitions.findMany({
      where: {
        OR: [
          { workflow_name: { contains: 'order', mode: 'insensitive' } },
          { workflow_key: { contains: 'order', mode: 'insensitive' } },
        ],
      },
    });

    allWorkflows.forEach(w => {
      console.log(`- ${w.workflow_name} (${w.workflow_key})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIntentMapping();
