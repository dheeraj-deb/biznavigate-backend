const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function checkExecutions() {
  try {
    // Get recent workflow executions
    const executions = await prisma.workflow_executions.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        execution_id: true,
        workflow_id: true,
        current_state: true,
        status: true,
        execution_context: true,
        error_message: true,
        created_at: true,
        updated_at: true,
      },
    });

    console.log('Recent workflow executions:\n');
    executions.forEach((exec, i) => {
      console.log(`${i + 1}. Execution ${exec.execution_id.substring(0, 8)}`);
      console.log(`   Status: ${exec.status}`);
      console.log(`   Current State: ${exec.current_state}`);
      console.log(`   Created: ${exec.created_at}`);
      console.log(`   Updated: ${exec.updated_at}`);

      if (exec.error_message) {
        console.log(`   Error: ${exec.error_message}`);
      }

      if (exec.execution_context) {
        console.log(`   Context keys: ${Object.keys(exec.execution_context).join(', ')}`);

        // Check if invoice exists in context
        if (exec.execution_context.invoice) {
          console.log(`   Invoice: ${JSON.stringify(exec.execution_context.invoice)}`);
        }

        // Check if order exists in context
        if (exec.execution_context.order) {
          console.log(`   Order ID: ${exec.execution_context.order.order_id}`);
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

checkExecutions();
