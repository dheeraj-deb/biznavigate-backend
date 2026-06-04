const postgres = require("postgres");

const templates = [
  {
    key: "general_lead_capture_template",
    name: "General Lead Capture Reply",
    business_type: "general",
    kind: "notification_template",
    version: "1.0.0",
    description: "A friendly WhatsApp reply for newly captured leads.",
    payload: {
      install_phase: "whatsapp_connected",
      template_key: "lead_capture_reply",
      template_name: "Lead Capture Reply",
      whatsapp_body:
        "Hi {{lead_name}}, thanks for reaching out to {{business_name}}. We have received your request and our team will get back to you shortly.",
      variables: ["lead_name", "business_name"],
      enabled_channels: ["whatsapp"],
      is_active: true,
    },
  },
  {
    key: "hospitality_booking_pipeline",
    name: "Hospitality Booking Pipeline",
    business_type: "hospitality",
    kind: "pipeline",
    version: "1.0.0",
    description: "Default CRM stages for rooms, activity, and event bookings.",
    payload: {
      install_phase: "onboarding",
      pipeline_name: "Bookings",
      is_default: true,
      stages: [
        { name: "New", slug: "new", color: "#64748b" },
        { name: "Contacted", slug: "contacted", color: "#0ea5e9" },
        { name: "Quoted", slug: "quoted", color: "#f59e0b" },
        { name: "Booked", slug: "won", is_won: true, color: "#22c55e" },
        { name: "Lost", slug: "lost", is_lost: true, color: "#ef4444" },
      ],
    },
  },
  {
    key: "retail_sales_pipeline",
    name: "Retail Sales Pipeline",
    business_type: "retail",
    kind: "pipeline",
    version: "1.0.0",
    description: "Default CRM stages for product inquiries and orders.",
    payload: {
      install_phase: "onboarding",
      pipeline_name: "Sales",
      is_default: true,
      stages: [
        { name: "New", slug: "new", color: "#64748b" },
        { name: "Interested", slug: "active", color: "#0ea5e9" },
        { name: "Quoted", slug: "quoted", color: "#f59e0b" },
        { name: "Won", slug: "won", is_won: true, color: "#22c55e" },
        { name: "Lost", slug: "lost", is_lost: true, color: "#ef4444" },
      ],
    },
  },
  {
    key: "hospitality_booking_followup_workflow",
    name: "Hospitality Booking Follow-up",
    business_type: "hospitality",
    kind: "workflow",
    version: "1.0.0",
    description: "Draft workflow scaffold for following up with booking leads.",
    payload: {
      install_phase: "whatsapp_connected",
      workflow_name: "Booking Follow-up",
      description: "Draft starter automation for booking inquiries.",
      is_active: false,
      nodes: [
        {
          id: "trigger_incoming_message",
          type: "trigger.incoming_message",
          label: "Incoming booking inquiry",
          params: { intents: ["booking", "availability"] },
        },
        {
          id: "send_ack",
          type: "action.send_message",
          label: "Send acknowledgement",
          params: {
            message:
              "Thanks for your interest in {{business.name}}. Please share your dates, guest count, and room preference.",
          },
        },
      ],
      connections: {
        trigger_incoming_message: [{ node: "send_ack" }],
      },
    },
  },
  {
    key: "retail_order_followup_workflow",
    name: "Retail Order Follow-up",
    business_type: "retail",
    kind: "workflow",
    version: "1.0.0",
    description: "Draft workflow scaffold for product inquiry follow-ups.",
    payload: {
      install_phase: "whatsapp_connected",
      workflow_name: "Order Follow-up",
      description: "Draft starter automation for product inquiries.",
      is_active: false,
      nodes: [
        {
          id: "trigger_product_inquiry",
          type: "trigger.incoming_message",
          label: "Incoming product inquiry",
          params: { intents: ["catalog", "order"] },
        },
        {
          id: "send_product_ack",
          type: "action.send_message",
          label: "Send acknowledgement",
          params: {
            message:
              "Thanks for contacting {{business.name}}. Please share the product name, size or variant, and quantity you need.",
          },
        },
      ],
      connections: {
        trigger_product_inquiry: [{ node: "send_product_ack" }],
      },
    },
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = postgres(process.env.DATABASE_URL, {
    prepare: false,
    ssl: "require",
  });

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS platform_starter_templates (
      template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key VARCHAR(120) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      business_type VARCHAR(50),
      kind VARCHAR(50) NOT NULL,
      version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
      description TEXT,
      payload JSONB NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_platform_starter_templates_lookup
      ON platform_starter_templates (business_type, kind, is_active);

    CREATE TABLE IF NOT EXISTS business_starter_template_installs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
      template_key VARCHAR(120) NOT NULL,
      template_kind VARCHAR(50) NOT NULL,
      installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (business_id, template_key)
    );

    CREATE INDEX IF NOT EXISTS idx_business_starter_template_installs_business
      ON business_starter_template_installs (business_id, installed_at DESC);
  `);

  for (const template of templates) {
    await sql`
      INSERT INTO platform_starter_templates (
        key,
        name,
        business_type,
        kind,
        version,
        description,
        payload,
        is_active,
        updated_at
      )
      VALUES (
        ${template.key},
        ${template.name},
        ${template.business_type},
        ${template.kind},
        ${template.version},
        ${template.description},
        ${sql.json(template.payload)},
        TRUE,
        NOW()
      )
      ON CONFLICT (key)
      DO UPDATE SET
        name = EXCLUDED.name,
        business_type = EXCLUDED.business_type,
        kind = EXCLUDED.kind,
        version = EXCLUDED.version,
        description = EXCLUDED.description,
        payload = EXCLUDED.payload,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `;
  }

  await sql.end();
  console.log(`Seeded ${templates.length} starter templates.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
