const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function checkWorkflow() {
  try {
    const workflow = await prisma.workflow_definitions.findFirst({
      where: {
        workflow_key: 'order-processing',
      },
    });

    if (!workflow) {
      console.error('❌ Workflow not found');
      return;
    }

    console.log('✅ Found workflow:', workflow.workflow_name);
    console.log('\n📋 Current workflow definition:');
    console.log(JSON.stringify(workflow.workflow_definition, null, 2));

    // Check if invoice states exist
    const states = workflow.workflow_definition.states;
    console.log('\n📊 Available states:');
    Object.keys(states).forEach(key => {
      console.log(`  - ${key}`);
    });

    if (states.fetch_product_details) {
      console.log('\n✅ Invoice generation states are present!');
    } else {
      console.log('\n❌ Invoice generation states are MISSING!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkflow();
