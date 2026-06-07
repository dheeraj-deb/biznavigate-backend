import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { PrismaService } from '../../../../prisma/prisma.service';
import { resolveBusinessGroupFromType } from '../domain/business-classification';
import { SYSTEM_WHATSAPP_TEMPLATE_BLUEPRINTS } from '../../../engagement/whatsapp-templates/system-whatsapp-template-blueprints';

type BlueprintGroup = 'A' | 'B' | 'C' | 'D';
type WorkflowBlueprint = { key: string; name: string; description: string; nodes: any[]; connections: any };

function connect(source: string, target: string) {
  return { [source]: { main: [{ node: target }] } };
}

function templateName(key: string): string {
  return SYSTEM_WHATSAPP_TEMPLATE_BLUEPRINTS.find((template) => template.key === key)?.name ?? key;
}

function sendTemplate(id: string, key: string, variables: string[]) {
  return {
    id,
    type: 'action.send_template',
    params: {
      template_name: templateName(key),
      language: 'en',
      variables,
    },
  };
}

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
      sendTemplate('send_interest_check', 'used_car_details_followup', ['lead.name', 'metadata.payload.car']),
    ],
    connections: connect('details_shared', 'send_interest_check'),
  },
  {
    key: 'used_car_visit_appointment',
    name: 'Used Car Visit Appointment',
    description: 'Ask the buyer to choose a showroom visit slot for a specific used car.',
    nodes: [
      { id: 'slots_available', type: 'trigger.event.vehicle_visit_slots_available', params: { event: 'vehicle.visit_slots_available' } },
      sendTemplate('send_visit_slots', 'used_car_visit_slots', ['lead.name', 'metadata.payload.car', 'metadata.payload.slot_1', 'metadata.payload.slot_2']),
    ],
    connections: connect('slots_available', 'send_visit_slots'),
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
        sendTemplate('send_exit', 'group_a_exit_interest_check', ['lead.name']),
      ],
      connections: connect('lead_quoted', 'send_exit'),
    },
  ],
  B: [
    {
      key: 'group_b_booking_confirmation',
      name: 'Booking Confirmation',
      description: 'Runs when booking.created is emitted.',
      nodes: [
        { id: 'booking_created', type: 'trigger.event.booking_created', params: { event: 'booking.created' } },
        sendTemplate('send_confirmation', 'booking_confirmation', ['lead.name', 'metadata.payload.booking_reference']),
      ],
      connections: connect('booking_created', 'send_confirmation'),
    },
    {
      key: 'resort_booking_link_followup',
      name: 'Resort Booking Link Follow-up',
      description: 'Reminder after a booking link is sent but the stay is not booked. Event should be emitted only after availability is checked.',
      nodes: [
        { id: 'booking_link_sent', type: 'trigger.event.booking_link_sent', params: { event: 'booking.link_sent' } },
        sendTemplate('send_booking_link_reminder', 'booking_link_followup', ['lead.name', 'metadata.payload.dates', 'metadata.payload.booking_link']),
      ],
      connections: connect('booking_link_sent', 'send_booking_link_reminder'),
    },
    {
      key: 'resort_room_available_alert',
      name: 'Resort Room Available Alert',
      description: 'Sent only when a room opens for dates the customer previously asked for.',
      nodes: [
        { id: 'room_available', type: 'trigger.event.room_available', params: { event: 'room.available' } },
        sendTemplate('send_room_available', 'room_available_alert', ['lead.name', 'metadata.payload.dates', 'metadata.payload.booking_link']),
      ],
      connections: connect('room_available', 'send_room_available'),
    },
    {
      key: 'resort_enquiry_followup',
      name: 'Resort Enquiry Follow-up',
      description: 'One reminder for customers who enquired but were not sent a booking link.',
      nodes: [
        { id: 'booking_followup_due', type: 'trigger.event.booking_followup_due', params: { event: 'booking.followup_due' } },
        sendTemplate('send_followup', 'booking_enquiry_followup', ['lead.name']),
      ],
      connections: connect('booking_followup_due', 'send_followup'),
    },
    {
      key: 'resort_checkin_reminder',
      name: 'Resort Check-in Reminder',
      description: 'Service reminder one day before check-in for booked guests.',
      nodes: [
        { id: 'checkin_due', type: 'trigger.event.booking_checkin_reminder_due', params: { event: 'booking.checkin_reminder_due' } },
        sendTemplate('send_checkin', 'checkin_reminder', ['lead.name', 'metadata.payload.check_in']),
      ],
      connections: connect('checkin_due', 'send_checkin'),
    },
    {
      key: 'resort_review_request',
      name: 'Resort Review Request',
      description: 'Review request after checkout for completed stays.',
      nodes: [
        { id: 'review_due', type: 'trigger.event.booking_review_request_due', params: { event: 'booking.review_request_due' } },
        sendTemplate('send_review_request', 'review_request', ['lead.name', 'metadata.payload.review_link']),
      ],
      connections: connect('review_due', 'send_review_request'),
    },
    {
      key: 'group_b_exit_intent',
      name: 'Group B Exit Intent',
      description: 'Fires when a booking lead reaches quoted status for date/price follow-up.',
      nodes: [
        { id: 'quote_shared', type: 'trigger.event.lead_status_changed', params: { event: 'lead.status_changed', to_status: ['quoted'] } },
        sendTemplate('send_exit', 'booking_enquiry_followup', ['lead.name']),
      ],
      connections: connect('quote_shared', 'send_exit'),
    },
  ],
  C: [
    {
      key: 'group_c_order_confirmation',
      name: 'Order Confirmation',
      description: 'Runs when order.placed is emitted.',
      nodes: [
        { id: 'order_placed', type: 'trigger.event.order_placed', params: { event: 'order.placed' } },
        sendTemplate('send_confirmation', 'order_confirmation', ['lead.name', 'metadata.payload.order_number']),
      ],
      connections: connect('order_placed', 'send_confirmation'),
    },
    {
      key: 'seller_stock_held',
      name: 'Seller Stock Held Reminder',
      description: 'Sent after stock is held for a customer before releasing it.',
      nodes: [
        { id: 'stock_held', type: 'trigger.event.stock_held', params: { event: 'stock.held' } },
        sendTemplate('send_stock_held', 'stock_held_reminder', ['lead.name', 'metadata.payload.product', 'metadata.payload.minutes', 'metadata.payload.payment_link']),
      ],
      connections: connect('stock_held', 'send_stock_held'),
    },
    {
      key: 'seller_payment_waiting',
      name: 'Seller Payment Waiting',
      description: 'Sent when the order is ready but payment is not completed.',
      nodes: [
        { id: 'payment_waiting', type: 'trigger.event.payment_waiting', params: { event: 'payment.waiting' } },
        sendTemplate('send_payment_waiting', 'payment_waiting', ['lead.name', 'metadata.payload.product', 'metadata.payload.payment_link']),
      ],
      connections: connect('payment_waiting', 'send_payment_waiting'),
    },
    {
      key: 'seller_restock_alert',
      name: 'Seller Restock Alert',
      description: 'Sent only when a product the customer asked for is restocked.',
      nodes: [
        { id: 'restocked', type: 'trigger.event.inventory_restocked', params: { event: 'inventory.restocked' } },
        sendTemplate('send_restocked', 'restock_alert', ['lead.name', 'metadata.payload.product']),
      ],
      connections: connect('restocked', 'send_restocked'),
    },
    {
      key: 'seller_credit_due',
      name: 'Seller Credit Due Reminder',
      description: 'Reminder for credit customers with an amount due.',
      nodes: [
        { id: 'credit_due', type: 'trigger.event.credit_due', params: { event: 'credit.due' } },
        sendTemplate('send_credit_due', 'credit_due', ['lead.name', 'metadata.payload.amount', 'metadata.payload.date']),
      ],
      connections: connect('credit_due', 'send_credit_due'),
    },
    {
      key: 'seller_dead_stock_offer',
      name: 'Seller Dead Stock Offer',
      description: 'Seller-selected offer campaign for relevant buyers.',
      nodes: [
        { id: 'dead_stock_offer', type: 'trigger.event.dead_stock_offer', params: { event: 'dead_stock.offer' } },
        sendTemplate('send_dead_stock_offer', 'dead_stock_offer', ['lead.name', 'metadata.payload.product_category', 'metadata.payload.offer_price']),
      ],
      connections: connect('dead_stock_offer', 'send_dead_stock_offer'),
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
    if (!process.env.MONGODB_URI) {
      return { status: 'skipped', reason: 'mongodb_not_connected' };
    }

    const mongoReady = await this.waitForMongoReady();
    if (!mongoReady) {
      this.logger.warn(
        `Workflow blueprint seed skipped for business ${business.business_id}: Mongo readyState=${mongoose.connection.readyState}`,
      );
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

  private async waitForMongoReady(timeoutMs = 5000): Promise<boolean> {
    const readyState = () => Number(mongoose.connection.readyState);
    if (readyState() === 1) return true;
    if (readyState() === 0 || readyState() === 3) return false;

    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (readyState() === 1) return true;
      if (readyState() === 0 || readyState() === 3) return false;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return readyState() === 1;
  }

  private getWorkflowBlueprintsForBusiness(businessType: string | null, group: BlueprintGroup): WorkflowBlueprint[] {
    const blueprints = [...GROUP_WORKFLOWS[group]];
    if (businessType === 'used_cars') {
      blueprints.push(...USED_CAR_WORKFLOWS);
    }
    return blueprints;
  }
}
