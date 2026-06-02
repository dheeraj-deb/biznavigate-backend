import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import mongoose from "mongoose";
import { PrismaService } from "../../../prisma/prisma.service";
import { StarterTemplatePhase, StarterTemplateQueryDto } from "./dto/apply-starter-template.dto";

type StarterTemplateKind = "pipeline" | "notification_template" | "workflow";

export interface StarterTemplateRow {
  template_id: string;
  key: string;
  name: string;
  business_type: string | null;
  kind: StarterTemplateKind;
  version: string;
  description: string | null;
  payload: any;
  is_active: boolean;
  install_phase?: StarterTemplatePhase;
}

interface ApplyTemplateOptions {
  businessId: string;
  templateKey: string;
  force?: boolean;
}

interface ApplyRecommendedTemplateOptions {
  phase?: StarterTemplatePhase;
}

@Injectable()
export class StarterTemplatesService {
  private readonly logger = new Logger(StarterTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listTemplates(query: StarterTemplateQueryDto = {}) {
    const rows = await this.prisma.$queryRaw<StarterTemplateRow[]>`
      SELECT
        template_id::text,
        key,
        name,
        business_type,
        kind,
        version,
        description,
        payload,
        is_active
      FROM platform_starter_templates
      WHERE is_active = TRUE
        AND (${query.business_type ?? null}::text IS NULL OR business_type = ${query.business_type ?? null} OR business_type IS NULL OR business_type = 'general')
        AND (${query.kind ?? null}::text IS NULL OR kind = ${query.kind ?? null})
      ORDER BY business_type NULLS LAST, kind, name
    `;

    return rows
      .map((row) => this.normalizeTemplate(row))
      .filter((template) => !query.phase || template.install_phase === query.phase);
  }

  async applyRecommendedTemplates(businessId: string, options: ApplyRecommendedTemplateOptions = {}) {
    const business = await this.getBusiness(businessId);
    const businessType = business.business_type ?? "general";
    const templates = await this.prisma.$queryRaw<StarterTemplateRow[]>`
      SELECT
        template_id::text,
        key,
        name,
        business_type,
        kind,
        version,
        description,
        payload,
        is_active
      FROM platform_starter_templates
      WHERE is_active = TRUE
        AND (business_type = ${businessType} OR business_type = 'general' OR business_type IS NULL)
      ORDER BY
        CASE WHEN business_type = ${businessType} THEN 0 ELSE 1 END,
        kind,
        name
    `;

    const eligibleTemplates = templates
      .map((row) => this.normalizeTemplate(row))
      .filter((template) => !options.phase || template.install_phase === options.phase);

    const results = [];
    for (const template of eligibleTemplates) {
      results.push(await this.applyTemplate(template, business));
    }

    return {
      business_id: businessId,
      business_type: businessType,
      phase: options.phase ?? "all",
      installed: results,
    };
  }

  async applyTemplateToBusiness(options: ApplyTemplateOptions) {
    const business = await this.getBusiness(options.businessId);
    const row = await this.findTemplateByKey(options.templateKey);
    const template = this.normalizeTemplate(row);

    if (
      template.business_type &&
      template.business_type !== "general" &&
      business.business_type &&
      template.business_type !== business.business_type
    ) {
      throw new BadRequestException(
        `Template '${template.key}' is for '${template.business_type}' businesses, not '${business.business_type}'`,
      );
    }

    return this.applyTemplate(template, business, options.force);
  }

  private async applyTemplate(template: StarterTemplateRow, business: any, force = false) {
    if (!force && (await this.wasInstalled(business.business_id, template.key))) {
      return {
        template_key: template.key,
        kind: template.kind,
        status: "skipped",
        reason: "already_installed",
      };
    }

    let result: Record<string, any>;
    switch (template.kind) {
      case "pipeline":
        result = await this.installPipeline(template, business);
        break;
      case "notification_template":
        result = await this.installNotificationTemplate(template, business);
        break;
      case "workflow":
        result = await this.installWorkflow(template, business);
        break;
      default:
        throw new BadRequestException(`Unsupported starter template kind '${template.kind}'`);
    }

    await this.markInstalled(business.business_id, template.key, template.kind);
    return {
      template_key: template.key,
      kind: template.kind,
      status: "installed",
      ...result,
    };
  }

  private async installPipeline(template: StarterTemplateRow, business: any) {
    const payload = template.payload ?? {};
    const stages = Array.isArray(payload.stages) ? payload.stages : [];
    if (!payload.pipeline_name || stages.length === 0) {
      throw new BadRequestException(`Pipeline template '${template.key}' is missing pipeline_name or stages`);
    }

    const existingDefault = await this.prisma.pipelines.findFirst({
      where: { business_id: business.business_id, is_default: true, is_archived: false },
      select: { pipeline_id: true },
    });

    const pipeline = await this.prisma.pipelines.create({
      data: {
        business_id: business.business_id,
        name: payload.pipeline_name,
        industry: template.business_type ?? business.business_type ?? "general",
        is_default: payload.is_default ?? !existingDefault,
        stages: {
          create: stages.map((stage: any, index: number) => ({
            business_id: business.business_id,
            name: stage.name,
            slug: stage.slug,
            position: stage.position ?? index + 1,
            is_won: stage.is_won ?? false,
            is_lost: stage.is_lost ?? false,
            color: stage.color,
          })),
        },
      },
      include: { stages: true },
    });

    return { pipeline_id: pipeline.pipeline_id, stages_created: pipeline.stages.length };
  }

  private async installNotificationTemplate(template: StarterTemplateRow, business: any) {
    const payload = template.payload ?? {};
    const templateKey = payload.template_key ?? template.key;
    const installed = await this.prisma.notification_templates.upsert({
      where: {
        business_id_template_key: {
          business_id: business.business_id,
          template_key: templateKey,
        },
      },
      create: {
        business_id: business.business_id,
        tenant_id: business.tenant_id,
        template_key: templateKey,
        template_name: payload.template_name ?? template.name,
        description: payload.description ?? template.description,
        email_subject: payload.email_subject,
        email_body: payload.email_body,
        email_html: payload.email_html,
        sms_body: payload.sms_body,
        whatsapp_body: payload.whatsapp_body,
        push_title: payload.push_title,
        push_body: payload.push_body,
        variables: payload.variables ?? [],
        enabled_channels: payload.enabled_channels ?? ["email", "sms", "whatsapp", "push"],
        is_active: payload.is_active ?? true,
        is_system: false,
        updated_at: new Date(),
      },
      update: {
        template_name: payload.template_name ?? template.name,
        description: payload.description ?? template.description,
        email_subject: payload.email_subject,
        email_body: payload.email_body,
        email_html: payload.email_html,
        sms_body: payload.sms_body,
        whatsapp_body: payload.whatsapp_body,
        push_title: payload.push_title,
        push_body: payload.push_body,
        variables: payload.variables ?? [],
        enabled_channels: payload.enabled_channels ?? ["email", "sms", "whatsapp", "push"],
        is_active: payload.is_active ?? true,
        updated_at: new Date(),
      },
    });

    return { notification_template_id: installed.template_id };
  }

  private async installWorkflow(template: StarterTemplateRow, business: any) {
    if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
      return { workflow_id: null, reason: "mongodb_not_connected" };
    }

    const payload = template.payload ?? {};
    const workflowId = crypto.randomUUID();
    const workflowDefinition = {
      nodes: Array.isArray(payload.nodes) ? payload.nodes : [],
      connections: payload.connections ?? {},
    };

    await mongoose.connection.collection("workflow_definitions").insertOne({
      workflow_id: workflowId,
      workflow_name: payload.workflow_name ?? template.name,
      business_type: business.business_type ?? template.business_type ?? "general",
      description: payload.description ?? template.description,
      version: payload.version ?? template.version ?? "1.0.0",
      workflow_definition: workflowDefinition,
      is_active: payload.is_active ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await mongoose.connection.collection("business_workflows").insertOne({
      business_id: business.business_id,
      tenant_id: business.tenant_id,
      workflow_id: workflowId,
      is_active: payload.is_active ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { workflow_id: workflowId };
  }

  private async getBusiness(businessId: string) {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: businessId },
      select: {
        business_id: true,
        tenant_id: true,
        business_type: true,
      },
    });
    if (!business) throw new NotFoundException(`Business ${businessId} not found`);
    return business;
  }

  private async findTemplateByKey(templateKey: string) {
    const rows = await this.prisma.$queryRaw<StarterTemplateRow[]>`
      SELECT
        template_id::text,
        key,
        name,
        business_type,
        kind,
        version,
        description,
        payload,
        is_active
      FROM platform_starter_templates
      WHERE key = ${templateKey}
        AND is_active = TRUE
      LIMIT 1
    `;
    if (!rows.length) throw new NotFoundException(`Starter template '${templateKey}' not found`);
    return rows[0];
  }

  private async wasInstalled(businessId: string, templateKey: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id::text
      FROM business_starter_template_installs
      WHERE business_id = ${businessId}::uuid
        AND template_key = ${templateKey}
      LIMIT 1
    `;
    return rows.length > 0;
  }

  private async markInstalled(businessId: string, templateKey: string, templateKind: string) {
    await this.prisma.$executeRaw`
      INSERT INTO business_starter_template_installs (business_id, template_key, template_kind)
      VALUES (${businessId}::uuid, ${templateKey}, ${templateKind})
      ON CONFLICT (business_id, template_key)
      DO UPDATE SET installed_at = NOW(), template_kind = EXCLUDED.template_kind
    `;
  }

  private normalizeTemplate(row: StarterTemplateRow): StarterTemplateRow {
    const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    return {
      ...row,
      payload,
      install_phase: this.getInstallPhase({ ...row, payload }),
    };
  }

  private getInstallPhase(template: StarterTemplateRow): StarterTemplatePhase {
    const explicitPhase = template.payload?.install_phase;
    if (explicitPhase === "onboarding" || explicitPhase === "whatsapp_connected") {
      return explicitPhase;
    }

    if (template.kind === "pipeline") return "onboarding";
    return "whatsapp_connected";
  }
}
