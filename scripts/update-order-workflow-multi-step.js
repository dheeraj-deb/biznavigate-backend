const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function updateOrderWorkflow() {
  try {
    // Find the order-processing workflow
    const workflow = await prisma.workflow_definitions.findFirst({
      where: {
        workflow_key: 'order-processing',
      },
    });

    if (!workflow) {
      console.error('❌ Order processing workflow not found');
      return;
    }

    console.log('✅ Found workflow:', workflow.workflow_name);

    // Updated workflow definition with proper multi-step handling
    const updatedDefinition = {
      initialState: 'determine_order_step',
      states: {
        // Determine which step of the order process we're in
        determine_order_step: {
          type: 'action',
          actions: [
            {
              actionId: 'check_order_step',
              type: 'script',
              params: {
                script: `
                  const categorySlug = context.entities?.category_slug;
                  console.log('Category slug:', categorySlug);

                  // Check what step we're at
                  const isCartConfirmation = categorySlug === 'confirm_cart';
                  const isDeliveryConfirmation = categorySlug === 'confirm_delivery';
                  const isOrderCancellation = categorySlug === 'cancel_order';

                  return {
                    isCartConfirmation,
                    isDeliveryConfirmation,
                    isOrderCancellation,
                    hasAddress: context.lastMessage && context.lastMessage.length > 10
                  };
                `,
              },
              outputVariable: 'orderStep',
            },
          ],
          transitions: [
            {
              condition: {
                type: 'expression',
                expression: 'context.orderStep.isCartConfirmation',
              },
              to: 'request_delivery_address',
            },
            {
              condition: {
                type: 'expression',
                expression: 'context.orderStep.isDeliveryConfirmation',
              },
              to: 'create_order',
            },
            {
              condition: {
                type: 'expression',
                expression: 'context.orderStep.isOrderCancellation',
              },
              to: 'cancel_order',
            },
            {
              condition: {
                type: 'expression',
                expression: 'context.orderStep.hasAddress && !context.orderStep.isCartConfirmation',
              },
              to: 'show_order_summary',
            },
            {
              to: 'validate_order_info',
            },
          ],
        },

        // Step 1: Request delivery address after cart confirmation
        request_delivery_address: {
          type: 'action',
          actions: [
            {
              actionId: 'send_address_request',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: '✅ Great! Please provide your delivery address:\n\n📍 Include: Street, City, State, Pincode',
                },
              },
            },
          ],
          transitions: [
            {
              to: 'end',
            },
          ],
        },

        // Step 2: Show order summary with delivery address
        show_order_summary: {
          type: 'action',
          actions: [
            {
              actionId: 'get_cart_items',
              type: 'script',
              params: {
                script: `
                  // TODO: Fetch actual cart items from database
                  // For now, return placeholder
                  return {
                    cartSummary: 'Your cart items will be displayed here',
                    deliveryAddress: context.lastMessage || 'Address provided'
                  };
                `,
              },
              outputVariable: 'cartData',
            },
            {
              actionId: 'send_summary',
              type: 'send_message',
              params: {
                content: {
                  type: 'INTERACTIVE',
                  interactive: {
                    type: 'button',
                    body: {
                      text: '📦 *Order Summary*\n\n*Items:*\n{{ context.cartData.cartSummary }}\n\n*Delivery Address:*\n{{ context.cartData.deliveryAddress }}\n\nPlease confirm to proceed with your order.',
                    },
                    action: {
                      buttons: [
                        {
                          type: 'reply',
                          reply: {
                            id: 'confirm_delivery',
                            title: '✅ Confirm Order',
                          },
                        },
                        {
                          type: 'reply',
                          reply: {
                            id: 'cancel_order',
                            title: '❌ Cancel',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
          transitions: [
            {
              to: 'end',
            },
          ],
        },

        // Step 3: Cancel order
        cancel_order: {
          type: 'action',
          actions: [
            {
              actionId: 'send_cancellation',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: '❌ Order cancelled. Feel free to browse our products anytime!',
                },
              },
            },
          ],
          transitions: [
            {
              to: 'end',
            },
          ],
        },

        // Fallback: Validate order info (for direct order requests)
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
              to: 'request_delivery_address',
            },
          ],
        },

        // Request missing info
        request_missing_info: {
          type: 'action',
          actions: [
            {
              actionId: 'send_request',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: 'I would be happy to help with your order! Could you please browse our products and add items to your cart?',
                },
              },
            },
          ],
          transitions: [
            {
              to: 'end',
            },
          ],
        },

        // Step 4: Create order, update inventory, generate invoice
        create_order: {
          type: 'action',
          actions: [
            {
              actionId: 'db_create_order',
              type: 'db_operation',
              params: {
                table: 'orders',
                operation: 'create',
                data: {
                  business_id: '{{ context.businessId }}',
                  lead_id: '{{ context.leadId }}',
                  tenant_id: '{{ context.tenantId }}',
                  order_status: 'confirmed',
                  metadata: {
                    products: '{{ context.entities.PRODUCT }}',
                    quantities: '{{ context.entities.QUANTITY }}',
                    delivery_address: '{{ context.deliveryAddress }}',
                  },
                },
              },
              outputVariable: 'order',
            },
            {
              actionId: 'update_inventory',
              type: 'script',
              params: {
                script: `
                  // TODO: Implement actual inventory update logic
                  console.log('Order created, inventory should be updated');
                  return { inventoryUpdated: true };
                `,
              },
              outputVariable: 'inventoryUpdate',
            },
            {
              actionId: 'generate_invoice',
              type: 'script',
              params: {
                script: `
                  // Generate invoice number
                  const invoiceNumber = 'INV-' + Date.now();
                  const invoiceDate = new Date().toLocaleDateString('en-IN');
                  console.log('Generated invoice:', invoiceNumber);
                  return { invoiceNumber, invoiceDate };
                `,
              },
              outputVariable: 'invoice',
            },
            {
              actionId: 'send_invoice',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: '✅ *Order Confirmed!*\n\n━━━━━━━━━━━━━━━━━━━\n📄 *INVOICE*\n━━━━━━━━━━━━━━━━━━━\n\n*Invoice No:* {{ context.invoice.invoiceNumber }}\n*Date:* {{ context.invoice.invoiceDate }}\n\n*Customer:* {{ context.leadName }}\n*Phone:* {{ context.leadPhone }}\n\n━━━━━━━━━━━━━━━━━━━\n\nYour order has been confirmed and is being processed.\n\nOur team will contact you shortly for delivery updates.\n\nThank you for your order! 🎉',
                },
              },
            },
            {
              actionId: 'notify_sales',
              type: 'notify_team',
              async: true,
              params: {
                team: 'sales',
                message: '🔔 New order from {{ context.leadName }} - Invoice: {{ context.invoice.invoiceNumber }}',
              },
            },
          ],
          transitions: [
            {
              to: 'end',
            },
          ],
        },

        // End state
        end: {
          type: 'end',
        },
      },
    };

    // Update the workflow
    await prisma.workflow_definitions.update({
      where: {
        workflow_id: workflow.workflow_id,
      },
      data: {
        workflow_definition: updatedDefinition,
      },
    });

    console.log('✅ Workflow updated successfully');
    console.log('\n📋 New Multi-Step Order Flow:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 1: User clicks "Confirm Cart" → Request delivery address');
    console.log('Step 2: User provides address → Show order summary with Confirm/Cancel');
    console.log('Step 3a: User clicks "Confirm Order" → Create order + Generate invoice');
    console.log('Step 3b: User clicks "Cancel" → Cancel order');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error updating workflow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrderWorkflow();
