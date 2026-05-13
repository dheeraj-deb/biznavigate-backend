import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entity_type') entityType?: string,
  ) {
    return this.auditLogService.findByBusiness(
      req.user.business_id,
      Number(page ?? 1),
      Number(limit ?? 50),
      entityType,
    );
  }
}
