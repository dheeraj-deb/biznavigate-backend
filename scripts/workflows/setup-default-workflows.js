const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function setupDefaultWorkflows() {
  try {
    console.log('🧹 Cleaning up and setting up default workflows...\n');

    // Find first business
    const business = await prisma.businesses.findFirst();

    if (!business) {
      console.error('❌ No business found');
      return;
    }

    const businessType = business.business_type || 'retail';
    console.log(`✅ Using business: ${business.business_id} (type: ${businessType})\n`);

    // First, delete business_workflows links (due to foreign key constraint)
    const deletedLinks = await prisma.business_workflows.deleteMany({
      where: { business_id: business.business_id }
    });
    console.log(`🗑️  Deleted ${deletedLinks.count} business workflow links\n`);

    // Then delete all old workflows for this business type
    const deleted = await prisma.workflow_definitions.deleteMany({
      where: { business_type: businessType }
    });
    console.log(`🗑️  Deleted ${deleted.count} old workflows for business type: ${businessType}\n`);

    // Define clean default workflows
    const workflows = [
      // 1. GREETING WORKFLOW
      {
        workflow_key: 'default-greeting',
        workflow_name: 'Default Greeting',
        intent_name: 'GREETING',
        description: 'Welcome message with main menu options',
        workflow_definition: {
          initialState: 'send_greeting',
          states: {
            send_greeting: {
              type: 'action',
              actions: [{
                type: 'send_message',
                actionId: 'greet_customer',
                params: {
                  content: {
                    type: 'INTERACTIVE',
                    interactive_type: 'list',
                    body: {
                      text: 'Hi there! 👋 Welcome to {{ context.businessName }}!\n\nHow can I assist you today?'
                    },
                    action: {
                      button: 'View Menu',
                      sections: [{
                        title: 'Main Menu',
                        rows: [
                          {
                            id: 'browse_products',
                            title: '🛍️ Browse Products',
                            description: 'View our product catalog'
                          },
                          {
                            id: 'view_cart',
                            title: '🛒 View Cart',
                            description: 'Check your shopping cart'
                          },
                          {
                            id: 'track_order',
                            title: '📦 Track Order',
                            description: 'Check your order status'
                          },
                          {
                            id: 'get_support',
                            title: '💬 Get Support',
                            description: 'Talk to our support team'
                          }
                        ]
                      }]
                    }
                  }
                }
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      },

      // 2. BROWSE PRODUCTS WORKFLOW
      {
        workflow_key: 'browse-products',
        workflow_name: 'Browse Products',
        intent_name: 'BROWSE_PRODUCTS',
        description: 'Show categories and products catalog',
        workflow_definition: {
          initialState: 'check_selection',
          states: {
            check_selection: {
              type: 'decision',
              transitions: [
                {
                  to: 'show_products_catalog',
                  priority: 1,
                  condition: {
                    type: 'expression',
                    expression: "context.entities && context.entities.category_slug && context.entities.category_slug !== 'browse_products'"
                  }
                },
                { to: 'show_categories' }
              ]
            },
            show_categories: {
              type: 'action',
              actions: [{
                type: 'fetch_categories',
                actionId: 'fetch_categories',
                params: {
                  bodyText: '🛍️ *Browse Our Products*\n\nSelect a category to view products:',
                  buttonText: 'View Categories',
                  sendMessage: true
                }
              }],
              transitions: [{ to: 'end' }]
            },
            show_products_catalog: {
              type: 'action',
              actions: [{
                type: 'handle_category_selection',
                actionId: 'handle_category_selection',
                params: {}
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      },

      // 3. VIEW CART WORKFLOW
      {
        workflow_key: 'view-cart',
        workflow_name: 'View Cart',
        intent_name: 'VIEW_CART',
        description: 'Display shopping cart contents',
        workflow_definition: {
          initialState: 'show_cart',
          states: {
            show_cart: {
              type: 'action',
              actions: [{
                type: 'view_cart',
                actionId: 'view_cart',
                params: {}
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      },

      // 4. PROCEED TO CHECKOUT WORKFLOW
      {
        workflow_key: 'proceed-checkout',
        workflow_name: 'Proceed to Checkout',
        intent_name: 'PROCEED_CHECKOUT',
        description: 'Check inventory and show cart with confirmation options',
        workflow_definition: {
          initialState: 'check_inventory_and_show_cart',
          states: {
            check_inventory_and_show_cart: {
              type: 'action',
              actions: [{
                type: 'view_cart',
                actionId: 'view_cart',
                params: { check_inventory: true }
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      },

      // 5. CHECKOUT WORKFLOW (when user clicks Confirm/Update/Add buttons)
      {
        workflow_key: 'checkout',
        workflow_name: 'Checkout',
        intent_name: 'CHECKOUT_CART',
        description: 'Handle cart confirmation and checkout actions',
        workflow_definition: {
          initialState: 'handle_action',
          states: {
            handle_action: {
              type: 'decision',
              transitions: [
                {
                  to: 'collect_address',
                  priority: 1,
                  condition: {
                    type: 'expression',
                    expression: "context.entities && context.entities.category_slug === 'confirm_cart'"
                  }
                },
                {
                  to: 'view_cart',
                  priority: 2,
                  condition: {
                    type: 'expression',
                    expression: "context.entities && context.entities.category_slug === 'update_cart'"
                  }
                },
                {
                  to: 'browse_products',
                  priority: 3,
                  condition: {
                    type: 'expression',
                    expression: "context.entities && context.entities.category_slug === 'add_more_products'"
                  }
                },
                { to: 'end' }
              ]
            },
            collect_address: {
              type: 'action',
              actions: [{
                type: 'collect_address',
                actionId: 'collect_address',
                params: {}
              }],
              transitions: [{ to: 'end' }]
            },
            view_cart: {
              type: 'action',
              actions: [{
                type: 'view_cart',
                actionId: 'view_cart',
                params: {}
              }],
              transitions: [{ to: 'end' }]
            },
            browse_products: {
              type: 'action',
              actions: [{
                type: 'fetch_categories',
                actionId: 'fetch_categories',
                params: {
                  bodyText: '🛍️ *Browse Our Products*\n\nSelect a category to view products:',
                  buttonText: 'View Categories',
                  sendMessage: true
                }
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      },

      // 6. ADDRESS SUBMISSION WORKFLOW
      {
        workflow_key: 'address-submission',
        workflow_name: 'Address Submission',
        intent_name: 'PROVIDE_ADDRESS',
        description: 'Save delivery address and show order confirmation',
        workflow_definition: {
          initialState: 'save_address',
          states: {
            save_address: {
              type: 'action',
              actions: [{
                type: 'save_address',
                actionId: 'save_address',
                params: {}
              }],
              transitions: [{ to: 'confirm_order' }]
            },
            confirm_order: {
              type: 'action',
              actions: [{
                type: 'confirm_order',
                actionId: 'confirm_order',
                params: {}
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      },

      // 7. PLACE ORDER WORKFLOW
      {
        workflow_key: 'place-order',
        workflow_name: 'Place Order',
        intent_name: 'PLACE_ORDER',
        description: 'Create order, check inventory, and generate invoice',
        workflow_definition: {
          initialState: 'process_order',
          states: {
            process_order: {
              type: 'action',
              actions: [{
                type: 'place_order',
                actionId: 'place_order',
                params: {}
              }],
              transitions: [{ to: 'end' }]
            },
            end: { type: 'end' }
          }
        }
      }
    ];

    // Create workflows and link to business
    for (const wf of workflows) {
      const created = await prisma.workflow_definitions.create({
        data: {
          workflow_key: wf.workflow_key,
          workflow_name: wf.workflow_name,
          intent_name: wf.intent_name,
          business_type: businessType,
          workflow_definition: wf.workflow_definition,
          description: wf.description,
          is_active: true
        }
      });

      // Link to business
      await prisma.business_workflows.create({
        data: {
          business_id: business.business_id,
          tenant_id: business.tenant_id,
          workflow_id: created.workflow_id,
          intent_name: wf.intent_name,
          is_active: true
        }
      });

      console.log(`✅ Created: [${wf.intent_name}] ${wf.workflow_key}`);
    }

    console.log(`\n✨ Successfully created ${workflows.length} default workflows!`);
    console.log(`\n📋 Workflow Flow (7 workflows):`);
    console.log(`   1. User says Hi → GREETING workflow → Show menu`);
    console.log(`   2. User clicks Browse Products → BROWSE_PRODUCTS workflow → Show categories`);
    console.log(`   3. User selects category → BROWSE_PRODUCTS workflow → Show products catalog`);
    console.log(`   4. User adds to cart (WhatsApp catalog) → Backend updates cart`);
    console.log(`   5. User clicks Confirm Cart → CHECKOUT_CART workflow → Collect address`);
    console.log(`   6. User provides address → PROVIDE_ADDRESS workflow → Show order confirmation`);
    console.log(`   7. User clicks Place Order → PLACE_ORDER workflow → Create order + invoice`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDefaultWorkflows();
