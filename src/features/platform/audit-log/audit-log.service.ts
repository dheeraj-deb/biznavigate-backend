import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AuditLogEntry {
  business_id: string;
  user_id?: string;
  action: string;       // 'created' | 'updated' | 'deleted' | 'login' | 'export' | 'viewed'
  entity_type: string;  // 'order' | 'customer' | 'lead' | 'subscription' | 'user' ...
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an audit event. Fire-and-forget: errors are logged, never thrown.
   * Call this from controllers/services after mutations.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.audit_logs.create({
        data: {
          business_id: entry.business_id,
          user_id: entry.user_id ?? null,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id ?? null,
          old_values: entry.old_values ? (entry.old_values as any) : undefined,
          new_values: entry.new_values ? (entry.new_values as any) : undefined,
          ip_address: entry.ip_address ?? null,
          user_agent: entry.user_agent ?? null,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write audit log', err?.message);
    }
  }

  async findByBusiness(
    businessId: string,
    page = 1,
    limit = 50,
    entityType?: string,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      business_id: businessId,
      ...(entityType ? { entity_type: entityType } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.audit_logs.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.audit_logs.count({ where }),
    ]);

    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }
}
