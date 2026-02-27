const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

async function createGreetingWorkflow() {
  try {
    console.log('Creating default greeting workflow...');

    // Find a business (use first active business)
    const business = await prisma.businesses.findFirst({
      where: { is_active: true }
    });

    if (!business) {
      console.error('No active business found');
      return;
    }

    const workflowDefinition = {
      workflow_key: 'default-greeting',
      workflow_name: 'Default Greeting Workflow',
      intent_name: 'GREETING',
      workflow_definition: {
        initialState: 'send_greeting',
        states: {
          send_greeting: {
            type: 'action',
            actions: [
              {
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
                      sections: [
                        {
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
                        }
                      ]
                    }
                  }
                }
              }
            ],
            transitions: [{ to: 'end' }]
          },
          end: {
            type: 'end'
          }
        }
      }
    };

    // Check if workflow exists
    const existing = await prisma.workflow_definitions.findFirst({
      where: {
        business_id: business.business_id,
        workflow_key: workflowDefinition.workflow_key
      }
    });

    if (existing) {
      // Update existing workflow
      await prisma.workflow_definitions.update({
        where: { workflow_id: existing.workflow_id },
        data: {
          workflow_name: workflowDefinition.workflow_name,
          intent_name: workflowDefinition.intent_name,
          workflow_definition: workflowDefinition.workflow_definition,
          is_active: true
        }
      });
      console.log('✅ Updated existing greeting workflow:', existing.workflow_id);
    } else {
      // Create new workflow
      const workflow = await prisma.workflow_definitions.create({
        data: {
          business_id: business.business_id,
          tenant_id: business.tenant_id,
          workflow_key: workflowDefinition.workflow_key,
          workflow_name: workflowDefinition.workflow_name,
          intent_name: workflowDefinition.intent_name,
          workflow_definition: workflowDefinition.workflow_definition,
          is_active: true
        }
      });
      console.log('✅ Created greeting workflow:', workflow.workflow_id);
    }

  } catch (error) {
    console.error('Error creating greeting workflow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGreetingWorkflow();
