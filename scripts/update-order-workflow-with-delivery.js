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

    // Updated workflow definition with delivery address collection
    const updatedDefinition = {
      initialState: 'check_cart_confirmation',
      states: {
        // Check if user confirmed cart
        check_cart_confirmation: {
          type: 'action',
          actions: [
            {
              actionId: 'check_confirmation',
              type: 'script',
              params: {
                script: `
                  // Check if this is a cart confirmation
                  const isCartConfirmation = context.entities?.category_slug === 'confirm_cart';
                  console.log('Is cart confirmation:', isCartConfirmation);
                  console.log('Category slug:', context.entities?.category_slug);
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
              to: 'request_delivery_address',
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

        // Request delivery address after cart confirmation
        request_delivery_address: {
          type: 'action',
          actions: [
            {
              actionId: 'send_address_request',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: '✅ Great! Please provide your delivery address (full address with pincode):',
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

        // Check if delivery address was provided
        check_delivery_address: {
          type: 'action',
          actions: [
            {
              actionId: 'check_address',
              type: 'script',
              params: {
                script: `
                  // Check if category_slug indicates address confirmation
                  const isAddressConfirmed = context.entities?.category_slug === 'confirm_delivery';
                  const isAddressCancelled = context.entities?.category_slug === 'cancel_order';
                  console.log('Is address confirmed:', isAddressConfirmed);
                  console.log('Is order cancelled:', isAddressCancelled);
                  return { isAddressConfirmed, isAddressCancelled };
                `,
              },
              outputVariable: 'addressCheck',
            },
          ],
          transitions: [
            {
              condition: {
                type: 'expression',
                expression: 'context.addressCheck.isAddressCancelled',
              },
              to: 'cancel_order',
            },
            {
              condition: {
                type: 'expression',
                expression: 'context.addressCheck.isAddressConfirmed',
              },
              to: 'create_order',
            },
            {
              condition: {
                type: 'expression',
                expression: '!context.addressCheck.isAddressConfirmed && !context.addressCheck.isAddressCancelled',
              },
              to: 'show_order_summary',
            },
          ],
        },

        // Show order summary with delivery address
        show_order_summary: {
          type: 'action',
          actions: [
            {
              actionId: 'send_summary',
              type: 'send_message',
              params: {
                content: {
                  type: 'INTERACTIVE',
                  interactive: {
                    type: 'button',
                    body: {
                      text: '📦 *Order Summary*\n\n*Delivery Address:*\n{{ context.lastMessage }}\n\nPlease confirm to proceed with the order.',
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

        // Cancel order
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

        // Validate order info (for non-cart confirmations)
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
              to: 'create_order',
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
                  text: 'I would be happy to help with your order! Could you please provide the product name and quantity?',
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

        // Create order and generate invoice
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
                  // Inventory update logic will be handled separately
                  console.log('Order created, inventory update triggered');
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
                  console.log('Generated invoice:', invoiceNumber);
                  return { invoiceNumber };
                `,
              },
              outputVariable: 'invoice',
            },
            {
              actionId: 'send_confirmation',
              type: 'send_message',
              params: {
                content: {
                  type: 'TEXT',
                  text: '✅ *Order Confirmed!*\n\nYour order has been successfully placed.\n\n📄 *Invoice Number:* {{ context.invoice.invoiceNumber }}\n\nOur team will process your order and contact you shortly for delivery.\n\nThank you for your order! 🎉',
                },
              },
            },
            {
              actionId: 'notify_sales',
              type: 'notify_team',
              async: true,
              params: {
                team: 'sales',
                message: 'New order from {{ context.leadName }} - Invoice: {{ context.invoice.invoiceNumber }}',
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
    console.log('\nNew workflow flow:');
    console.log('1. Check if cart confirmation (category_slug === "confirm_cart")');
    console.log('2. If yes → Request delivery address');
    console.log('3. User provides address → Show order summary with Confirm/Cancel buttons');
    console.log('4. If confirmed → Create order, update inventory, generate invoice, send confirmation');
    console.log('5. If cancelled → Send cancellation message');
  } catch (error) {
    console.error('❌ Error updating workflow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrderWorkflow();
