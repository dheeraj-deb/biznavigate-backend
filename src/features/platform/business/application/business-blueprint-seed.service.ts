import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { PrismaService } from '../../../../prisma/prisma.service';
import { resolveBusinessGroupFromType } from '../domain/business-classification';

type BlueprintGroup = 'A' | 'B' | 'C' | 'D';
type WorkflowBlueprint = { key: string; name: string; description: string; nodes: any[]; connections: any };

const GROUP_PIPELINES: Record<BlueprintGroup, { name: string; industry: string; stages: Array<any> }> = {
  A: {
    name: 'High Ticket Sales',
    industry: 'group_a',
    stages: [
      { slug: 'new', name: 'New Enquiry', position: 1, color: '#94a3b8' },
      { slug: 'qualified', name: 'Engaged', position: 2, color: '#60a5fa' },
      { slug: 'quoted', name: 'Price Shared', position: 3, color: '#f59e0b' },
      { slug: 'booked', name: 'Visit Ready', position: 4, color: '#10b981' },
      { slug: 'won', name: 'Won', position: 5, color: '#059669', is_won: true },
      { slug: 'lost', name: 'Lost', position: 6, color: '#ef4444', is_lost: true },
    ],
  },
  B: {
    name: 'Bookings',
    industry: 'group_b',
    stages: [
      { slug: 'new', name: 'New Enquiry', position: 1, color: '#94a3b8' },
      { slug: 'qualified', name: 'Dates Collected', position: 2, color: '#60a5fa' },
      { slug: 'quoted', name: 'Quote Shared', position: 3, color: '#f59e0b' },
      { slug: 'booked', name: 'Booked', position: 4, color: '#10b981' },
      { slug: 'won', name: 'Checked In / Completed', position: 5, color: '#059669', is_won: true },
      { slug: 'lost', name: 'Lost', position: 6, color: '#ef4444', is_lost: true },
    ],
  },
  C: {
    name: 'Product Sales',
    industry: 'group_c',
    stages: [
      { slug: 'new', name: 'New Enquiry', position: 1, color: '#94a3b8' },
      { slug: 'qualified', name: 'Product Interest', position: 2, color: '#60a5fa' },
      { slug: 'quoted', name: 'Quote Shared', position: 3, color: '#f59e0b' },
      { slug: 'booked', name: 'Order Created', position: 4, color: '#10b981' },
      { slug: 'won', name: 'Won', position: 5, color: '#059669', is_won: true },
      { slug: 'lost', name: 'Lost', position: 6, color: '#ef4444', is_lost: true },
    ],
  },
  D: {
    name: 'Service Pipeline',
    industry: 'group_d',
    stages: [
      { slug: 'new', name: 'New Enquiry', position: 1, color: '#94a3b8' },
      { slug: 'contacted', name: 'Contacted', position: 2, color: '#60a5fa' },
      { slug: 'qualified', name: 'Qualified', position: 3, color: '#a78bfa' },
      { slug: 'quoted', name: 'Proposal Shared', position: 4, color: '#f59e0b' },
      { slug: 'won', name: 'Won', position: 5, color: '#059669', is_won: true },
      { slug: 'lost', name: 'Lost', position: 6, color: '#ef4444', is_lost: true },
    ],
  },
};

const USED_CAR_WORKFLOWS: WorkflowBlueprint[] = [
  {
    key: 'used_car_silent_after_details',
    name: 'Used Car Silent After Details',
    description: 'Follow-up after car details are shared and stock is confirmed, when the buyer goes silent.',
    nodes: [
      { id: 'details_shared', type: 'trigger.event.vehicle_details_shared', params: { event: 'vehicle.details_shared' } },
      {
        id: 'send_interest_check',
        type: 'action.send_message',
        params: {
          message: 'Hi ${lead.name}, just checking if you are still interested in ${metadata.payload.car}. We can keep a visit slot for you today or tomorrow.',
        },
      },
    ],
    connections: { details_shared: [{ node: 'send_interest_check' }] },
  },
  {
    key: 'used_car_visit_appointment',
    name: 'Used Car Visit Appointment',
    description: 'Ask the buyer to choose a showroom visit slot for a specific used car.',
    nodes: [
      { id: 'slots_available', type: 'trigger.event.vehicle_visit_slots_available', params: { event: 'vehicle.visit_slots_available' } },
      {
        id: 'send_visit_slots',
        type: 'action.send_message_with_btns',
        params: {
          message: 'Would you like to book a showroom visit for ${metadata.payload.car}? Available slots: ${metadata.payload.slot_1}, ${metadata.payload.slot_2}.',
          buttons: [
            { id: 'visit_slot_1', title: 'Slot 1' },
            { id: 'visit_slot_2', title: 'Slot 2' },
            { id: 'visit_not_now', title: 'Not now' },
          ],
        },
      },
    ],
    connections: { slots_available: [{ node: 'send_visit_slots' }] },
  },
];

const GROUP_WORKFLOWS: Record<BlueprintGroup, WorkflowBlueprint[]> = {
  A: [
    {
      key: 'group_a_exit_intent',
      name: 'Group A Exit Intent',
      description: 'Fires when a high-ticket lead reaches quoted status and can be used for 24-72h silent follow-up.',
      nodes: [
        { id: 'lead_quoted', type: 'trigger.event.lead_status_changed', params: { event: 'lead.status_changed', to_status: ['quoted'] } },
        {
          id: 'send_exit',
          type: 'action.send_message_with_btns',
          params: {
            message: 'Hi {{lead.name}}! Still interested?',
            buttons: [
              { id: 'exit_yes_interested', title: 'Yes, interested' },
              { id: 'exit_price_high', title: 'Price too high' },
              { id: 'exit_not_interested', title: 'Not interested' },
            ],
          },
        },
      ],
      connections: { lead_quoted: [{ node: 'send_exit' }] },
    },
  ],
  B: [
    {
      key: 'group_b_booking_confirmation',
      name: 'Booking Confirmation',
      description: 'Runs when booking.created is emitted.',
      nodes: [
        { id: 'booking_created', type: 'trigger.event.booking_created', params: { event: 'booking.created' } },
        { id: 'send_confirmation', type: 'action.send_message', params: { message: 'Your booking is confirmed. We will share details shortly.' } },
      ],
      connections: { booking_created: [{ node: 'send_confirmation' }] },
    },
    {
      key: 'resort_booking_link_followup',
      name: 'Resort Booking Link Follow-up',
      description: 'Reminder after a booking link is sent but the stay is not booked. Event should be emitted only after availability is checked.',
      nodes: [
        { id: 'booking_link_sent', type: 'trigger.event.booking_link_sent', params: { event: 'booking.link_sent' } },
        {
          id: 'send_booking_link_reminder',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, your room is still available for ${metadata.payload.dates}. To avoid losing it, please confirm here: ${metadata.payload.booking_link}',
          },
        },
      ],
      connections: { booking_link_sent: [{ node: 'send_booking_link_reminder' }] },
    },
    {
      key: 'resort_room_available_alert',
      name: 'Resort Room Available Alert',
      description: 'Sent only when a room opens for dates the customer previously asked for.',
      nodes: [
        { id: 'room_available', type: 'trigger.event.room_available', params: { event: 'room.available' } },
        {
          id: 'send_room_available',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, a room is now available for ${metadata.payload.dates}. If you still need it, you can book here: ${metadata.payload.booking_link}',
          },
        },
      ],
      connections: { room_available: [{ node: 'send_room_available' }] },
    },
    {
      key: 'resort_enquiry_followup',
      name: 'Resort Enquiry Follow-up',
      description: 'One reminder for customers who enquired but were not sent a booking link.',
      nodes: [
        { id: 'booking_followup_due', type: 'trigger.event.booking_followup_due', params: { event: 'booking.followup_due' } },
        {
          id: 'send_followup',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, just checking if you still need stay. We can help confirm it now if needed.',
          },
        },
      ],
      connections: { booking_followup_due: [{ node: 'send_followup' }] },
    },
    {
      key: 'resort_checkin_reminder',
      name: 'Resort Check-in Reminder',
      description: 'Service reminder one day before check-in for booked guests.',
      nodes: [
        { id: 'checkin_due', type: 'trigger.event.booking_checkin_reminder_due', params: { event: 'booking.checkin_reminder_due' } },
        {
          id: 'send_checkin',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, reminder for your stay on ${metadata.payload.check_in}. We are ready to welcome you.',
          },
        },
      ],
      connections: { checkin_due: [{ node: 'send_checkin' }] },
    },
    {
      key: 'resort_review_request',
      name: 'Resort Review Request',
      description: 'Review request after checkout for completed stays.',
      nodes: [
        { id: 'review_due', type: 'trigger.event.booking_review_request_due', params: { event: 'booking.review_request_due' } },
        {
          id: 'send_review_request',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, thank you for staying with us. Please share your review here: ${metadata.payload.review_link}',
          },
        },
      ],
      connections: { review_due: [{ node: 'send_review_request' }] },
    },
    {
      key: 'group_b_exit_intent',
      name: 'Group B Exit Intent',
      description: 'Fires when a booking lead reaches quoted status for date/price follow-up.',
      nodes: [
        { id: 'quote_shared', type: 'trigger.event.lead_status_changed', params: { event: 'lead.status_changed', to_status: ['quoted'] } },
        {
          id: 'send_exit',
          type: 'action.send_message_with_btns',
          params: {
            message: 'Still planning your dates?',
            buttons: [
              { id: 'exit_book_now', title: 'Yes, book' },
              { id: 'exit_changed_dates', title: 'Different dates' },
              { id: 'exit_not_anymore', title: 'Not anymore' },
            ],
          },
        },
      ],
      connections: { quote_shared: [{ node: 'send_exit' }] },
    },
  ],
  C: [
    {
      key: 'group_c_order_confirmation',
      name: 'Order Confirmation',
      description: 'Runs when order.placed is emitted.',
      nodes: [
        { id: 'order_placed', type: 'trigger.event.order_placed', params: { event: 'order.placed' } },
        { id: 'send_confirmation', type: 'action.send_message', params: { message: 'Your order is confirmed. We will update you on delivery.' } },
      ],
      connections: { order_placed: [{ node: 'send_confirmation' }] },
    },
    {
      key: 'seller_stock_held',
      name: 'Seller Stock Held Reminder',
      description: 'Sent after stock is held for a customer before releasing it.',
      nodes: [
        { id: 'stock_held', type: 'trigger.event.stock_held', params: { event: 'stock.held' } },
        {
          id: 'send_stock_held',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, we have kept ${metadata.payload.product} for you. It will be released in ${metadata.payload.minutes} minutes. Pay/confirm here: ${metadata.payload.payment_link}',
          },
        },
      ],
      connections: { stock_held: [{ node: 'send_stock_held' }] },
    },
    {
      key: 'seller_payment_waiting',
      name: 'Seller Payment Waiting',
      description: 'Sent when the order is ready but payment is not completed.',
      nodes: [
        { id: 'payment_waiting', type: 'trigger.event.payment_waiting', params: { event: 'payment.waiting' } },
        {
          id: 'send_payment_waiting',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, your order for ${metadata.payload.product} is ready. Please complete payment here: ${metadata.payload.payment_link}',
          },
        },
      ],
      connections: { payment_waiting: [{ node: 'send_payment_waiting' }] },
    },
    {
      key: 'seller_restock_alert',
      name: 'Seller Restock Alert',
      description: 'Sent only when a product the customer asked for is restocked.',
      nodes: [
        { id: 'restocked', type: 'trigger.event.inventory_restocked', params: { event: 'inventory.restocked' } },
        {
          id: 'send_restocked',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, ${metadata.payload.product} is back in stock now. Reply YES if you want us to keep one for you.',
          },
        },
      ],
      connections: { restocked: [{ node: 'send_restocked' }] },
    },
    {
      key: 'seller_credit_due',
      name: 'Seller Credit Due Reminder',
      description: 'Reminder for credit customers with an amount due.',
      nodes: [
        { id: 'credit_due', type: 'trigger.event.credit_due', params: { event: 'credit.due' } },
        {
          id: 'send_credit_due',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, your credit due is ${metadata.payload.amount}. Please pay by ${metadata.payload.date}. Reply if you need the bill details.',
          },
        },
      ],
      connections: { credit_due: [{ node: 'send_credit_due' }] },
    },
    {
      key: 'seller_dead_stock_offer',
      name: 'Seller Dead Stock Offer',
      description: 'Seller-selected offer campaign for relevant buyers.',
      nodes: [
        { id: 'dead_stock_offer', type: 'trigger.event.dead_stock_offer', params: { event: 'dead_stock.offer' } },
        {
          id: 'send_dead_stock_offer',
          type: 'action.send_message',
          params: {
            message: 'Hi ${lead.name}, we have a limited offer on ${metadata.payload.product_category}. Price now ${metadata.payload.offer_price}. Reply YES to order.',
          },
        },
      ],
      connections: { dead_stock_offer: [{ node: 'send_dead_stock_offer' }] },
    },
  ],
  D: [],
};

@Injectable()
export class BusinessBlueprintSeedService {
  private readonly logger = new Logger(BusinessBlueprintSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedForBusiness(businessId: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: {
        business_id: true,
        tenant_id: true,
        business_type: true,
        business_group: true,
        blueprint_seeded: true,
      },
    });
    if (!business) throw new Error(`Business ${businessId} not found`);

    const group = (business.business_group ?? resolveBusinessGroupFromType(business.business_type)) as BlueprintGroup | null;
    if (!group) {
      return { status: 'skipped', reason: 'unsupported_business_type' };
    }

    const pipeline = await this.ensurePipeline(business.business_id, group);
    const workflowResult = await this.ensureWorkflows(business, group);

    const seededAt = new Date();
    await this.prisma.businesses.update({
      where: { business_id: business.business_id },
      data: {
        business_group: group,
        blueprint_seeded: true,
        blueprint_seeded_at: seededAt,
      },
    });

    return {
      status: 'seeded',
      group,
      pipeline_id: pipeline.pipeline_id,
      workflows: workflowResult,
      blueprint_seeded_at: seededAt,
    };
  }

  private async ensurePipeline(businessId: string, group: BlueprintGroup) {
    const existing = await this.prisma.pipelines.findFirst({
      where: { business_id: businessId, is_default: true, is_archived: false },
      select: { pipeline_id: true },
    });
    if (existing) return existing;

    const template = GROUP_PIPELINES[group];
    return this.prisma.pipelines.create({
      data: {
        business_id: businessId,
        name: template.name,
        industry: template.industry,
        is_default: true,
        stages: {
          create: template.stages.map((stage) => ({
            business_id: businessId,
            name: stage.name,
            slug: stage.slug,
            position: stage.position,
            color: stage.color,
            is_won: stage.is_won ?? false,
            is_lost: stage.is_lost ?? false,
          })),
        },
      },
      select: { pipeline_id: true },
    });
  }

  private async ensureWorkflows(
    business: { business_id: string; tenant_id: string; business_type: string | null },
    group: BlueprintGroup,
  ) {
    if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
      return { status: 'skipped', reason: 'mongodb_not_connected' };
    }

    const blueprints = this.getWorkflowBlueprintsForBusiness(business.business_type, group);
    const installed = [];
    for (const blueprint of blueprints) {
      const workflowId = `bp_${business.business_id}_${blueprint.key}`;
      const existing = await mongoose.connection.collection('workflow_definitions').findOne({ workflow_id: workflowId });
      if (!existing) {
        await mongoose.connection.collection('workflow_definitions').insertOne({
          workflow_id: workflowId,
          workflow_name: blueprint.name,
          business_type: business.business_type ?? 'general',
          description: blueprint.description,
          version: '1.0.0',
          workflow_definition: { nodes: blueprint.nodes, connections: blueprint.connections },
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          blueprint_key: blueprint.key,
        });
      }

      await mongoose.connection.collection('business_workflows').updateOne(
        { business_id: business.business_id, workflow_id: workflowId },
        {
          $setOnInsert: {
            business_id: business.business_id,
            tenant_id: business.tenant_id,
            workflow_id: workflowId,
            created_at: new Date(),
          },
          $set: { is_active: true, updated_at: new Date() },
        },
        { upsert: true },
      );

      installed.push({ key: blueprint.key, workflow_id: workflowId });
    }

    return { status: 'seeded', installed };
  }

  private getWorkflowBlueprintsForBusiness(businessType: string | null, group: BlueprintGroup): WorkflowBlueprint[] {
    const blueprints = [...GROUP_WORKFLOWS[group]];
    if (businessType === 'used_cars') {
      blueprints.push(...USED_CAR_WORKFLOWS);
    }
    return blueprints;
  }
}
