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

    // Updated workflow definition
    const updatedDefinition = {
      initialState: 'check_cart_confirmation',
      states: {
        // New initial state: Check if user confirmed cart
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

        // Process confirmed cart
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
          transitions: [
            {
              to: 'create_order',
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

        // Create order
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
                  order_status: 'pending',
                  order_type: 'product_order',
                  metadata: {
                    products: '{{ context.entities.PRODUCT }}',
                    quantities: '{{ context.entities.QUANTITY }}',
                  },
                },
              },
              outputVariable: 'order',
            },
          ],
          transitions: [
            {
              to: 'fetch_product_details',
            },
          ],
        },

        // Fetch product details from database
        fetch_product_details: {
          type: 'action',
          actions: [
            {
              actionId: 'extract_products',
              type: 'script',
              params: {
                script: `
                  // Extract product names from order metadata
                  const products = context.order.metadata?.products || [];
                  console.log('Products from order:', products);
                  return { productNames: products };
                `,
              },
              outputVariable: 'productInfo',
            },
            {
              actionId: 'fetch_products',
              type: 'db_operation',
              params: {
                table: 'products',
                operation: 'findMany',
                where: {
                  business_id: '{{ context.businessId }}',
                  name: {
                    in: '{{ context.productInfo.productNames }}',
                  },
                },
              },
              outputVariable: 'productDetails',
            },
          ],
          transitions: [
            {
              to: 'generate_invoice',
            },
          ],
        },

        // Generate invoice with calculations
        generate_invoice: {
          type: 'action',
          actions: [
            {
              actionId: 'calculate_invoice',
              type: 'script',
              params: {
                script: `
                  const products = context.order.metadata?.products || [];
                  const quantities = context.order.metadata?.quantities || [];
                  const productDetails = context.productDetails || [];

                  // Create a map of product names to details
                  const productMap = {};
                  productDetails.forEach(p => {
                    productMap[p.name] = p;
                  });

                  // Calculate invoice items
                  let subtotal = 0;
                  const items = products.map((productName, index) => {
                    const qty = parseInt(quantities[index]) || 1;
                    const product = productMap[productName];
                    const price = product ? parseFloat(product.price) : 0;
                    const itemTotal = price * qty;
                    subtotal += itemTotal;

                    return {
                      name: productName,
                      quantity: qty,
                      price: price,
                      total: itemTotal
                    };
                  });

                  // Calculate tax (18% GST)
                  const taxRate = 0.18;
                  const taxAmount = subtotal * taxRate;
                  const total = subtotal + taxAmount;

                  return {
                    items: items,
                    subtotal: subtotal.toFixed(2),
                    taxAmount: taxAmount.toFixed(2),
                    total: total.toFixed(2)
                  };
                `,
              },
              outputVariable: 'invoice',
            },
          ],
          transitions: [
            {
              to: 'send_invoice',
            },
          ],
        },

        // Send invoice to user
        send_invoice: {
          type: 'action',
          actions: [
            {
              actionId: 'send_invoice_message',
              type: 'send_invoice_message',
              params: {
                invoice: '{{ context.invoice }}',
                order: '{{ context.order }}',
              },
            },
            {
              actionId: 'notify_sales',
              type: 'notify_team',
              async: true,
              params: {
                team: 'sales',
                message: 'New order - Total: ₹{{ context.invoice.total }}',
              },
            },
          ],
          transitions: [
            {
              to: 'update_order_totals',
            },
          ],
        },

        // Update order with calculated totals
        update_order_totals: {
          type: 'action',
          actions: [
            {
              actionId: 'update_order',
              type: 'db_operation',
              params: {
                table: 'orders',
                operation: 'update',
                where: {
                  order_id: '{{ context.order.order_id }}',
                },
                data: {
                  subtotal: '{{ context.invoice.subtotal }}',
                  tax_amount: '{{ context.invoice.taxAmount }}',
                  total_amount: '{{ context.invoice.total }}',
                },
              },
              outputVariable: 'updatedOrder',
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
    console.log('2a. If yes → Process cart confirmation → Create order');
    console.log('2b. If no → Validate order info → Request missing info or Create order');
    console.log('3. Fetch product details from database');
    console.log('4. Generate invoice (calculate subtotal, tax, total)');
    console.log('5. Send formatted invoice to user');
    console.log('6. Update order with calculated totals');
  } catch (error) {
    console.error('❌ Error updating workflow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrderWorkflow();
