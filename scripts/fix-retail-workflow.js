const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function fixRetailOrderWorkflow() {
  try {
    const workflowId = '6e3c13bc-d626-4db6-8c32-9407f3a80742';

    const workflow = await prisma.workflow_definitions.findUnique({
      where: { workflow_id: workflowId },
    });

    if (!workflow) {
      console.error('❌ Workflow not found');
      return;
    }

    console.log('✅ Found workflow:', workflow.workflow_name);

    // Simplified workflow that avoids template variable issues
    const updatedDefinition = {
      initialState: 'check_cart_confirmation',
      states: {
        check_cart_confirmation: {
          type: 'action',
          actions: [
            {
              actionId: 'check_confirmation',
              type: 'script',
              params: {
                script: `
                  const isCartConfirmation = context.entities?.category_slug === 'confirm_cart';
                  console.log('Is cart confirmation:', isCartConfirmation);
                  return { isCartConfirmation };
                `,
              },
              outputVariable: 'confirmationCheck',
            },
          ],
          transitions: [
            {
              condition: {
                type: 'expression',
                expression: 'context.confirmationCheck.isCartConfirmation',
              },
              to: 'process_cart_confirmation',
            },
            {
              condition: {
                type: 'expression',
                expression: '!context.confirmationCheck.isCartConfirmation',
              },
              to: 'validate_order_info',
            },
          ],
        },

        process_cart_confirmation: {
          type: 'action',
          actions: [
            {
              actionId: 'send_processing',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: '✅ Great! Processing your order now...',
                },
              },
            },
          ],
          transitions: [{ to: 'create_order_and_invoice' }],
        },

        validate_order_info: {
          type: 'action',
          actions: [
            {
              actionId: 'check_required',
              type: 'script',
              params: {
                script: `
                  const hasProduct = context.entities.PRODUCT?.length > 0;
                  const hasQuantity = context.entities.QUANTITY?.length > 0;
                  return { complete: hasProduct && hasQuantity };
                `,
              },
              outputVariable: 'validation',
            },
          ],
          transitions: [
            {
              condition: {
                type: 'expression',
                expression: '!context.validation.complete',
              },
              to: 'request_missing_info',
            },
            {
              condition: {
                type: 'expression',
                expression: 'context.validation.complete',
              },
              to: 'create_order_and_invoice',
            },
          ],
        },

        request_missing_info: {
          type: 'action',
          actions: [
            {
              actionId: 'send_request',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: 'I would be happy to help with your order! Could you please provide the product name and quantity?',
                },
              },
            },
          ],
          transitions: [{ to: 'end' }],
        },

        // Single action that does everything: create order, fetch products, calculate invoice, send message
        create_order_and_invoice: {
          type: 'action',
          actions: [
            {
              actionId: 'process_order_with_invoice',
              type: 'send_invoice_message',
              params: {},
            },
          ],
          transitions: [{ to: 'end' }],
        },

        end: {
          type: 'end',
        },
      },
    };

    await prisma.workflow_definitions.update({
      where: { workflow_id: workflowId },
      data: {
        workflow_definition: updatedDefinition,
      },
    });

    console.log('✅ Workflow updated with simplified approach');
    console.log('\nKey changes:');
    console.log('1. Removed separate states for order creation, product fetching, etc.');
    console.log('2. Using single send_invoice_message action that handles everything');
    console.log('3. Action will create order, fetch products, calculate invoice, and send message');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRetailOrderWorkflow();
