const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function listIntents() {
  try {
    const intents = await prisma.intents.findMany({
      select: {
        intent_name: true,
        business_workflows: {
          include: {
            workflow_definitions: {
              select: {
                workflow_name: true,
                workflow_key: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${intents.length} intents:\n`);

    intents.forEach((intent, i) => {
      console.log(`${i + 1}. ${intent.intent_name}`);

      if (intent.business_workflows.length > 0) {
        console.log(`   Workflows:`);
        intent.business_workflows.forEach(bw => {
          console.log(`     - ${bw.workflow_definitions.workflow_name} (${bw.workflow_definitions.workflow_key})`);
        });
      } else {
        console.log(`   Workflows: None`);
      }

      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listIntents();
