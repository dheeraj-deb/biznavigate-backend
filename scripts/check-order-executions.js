const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function checkOrderExecutions() {
  try {
    // Get workflow definition for order-processing
    const workflow = await prisma.workflow_definitions.findFirst({
      where: { workflow_key: 'order-processing' },
    });

    if (!workflow) {
      console.log('No order-processing workflow found');
      return;
    }

    console.log(`Workflow: ${workflow.workflow_name} (${workflow.workflow_id})\n`);

    // Get recent executions for this workflow
    const executions = await prisma.workflow_executions.findMany({
      where: { workflow_id: workflow.workflow_id },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    console.log(`Found ${executions.length} executions:\n`);

    executions.forEach((exec, i) => {
      console.log(`${i + 1}. Execution ${exec.execution_id.substring(0, 8)}`);
      console.log(`   Status: ${exec.status}`);
      console.log(`   Current State: ${exec.current_state}`);
      console.log(`   Created: ${exec.created_at}`);

      if (exec.error_message) {
        console.log(`   ERROR: ${exec.error_message}`);
      }

      if (exec.execution_context) {
        const ctx = exec.execution_context;

        console.log(`   Intent: ${ctx.intent}`);
        console.log(`   Entities: ${JSON.stringify(ctx.entities)}`);

        if (ctx.order) {
          console.log(`   ✅ Order created: ${ctx.order.order_id}`);
        }

        if (ctx.invoice) {
          console.log(`   ✅ Invoice: ${JSON.stringify(ctx.invoice)}`);
        }

        if (ctx.productDetails) {
          console.log(`   ✅ Products fetched: ${ctx.productDetails.length} items`);
        }
      }

      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderExecutions();
