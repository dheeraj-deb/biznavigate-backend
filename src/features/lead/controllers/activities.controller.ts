import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { LeadService } from '../application/services/lead.service';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @ApiOperation({ summary: 'Business activity feed — recent lead events across all leads' })
  getActivities(
    @Req() req: any,
    @Query('businessId') businessId?: string,
    @Query('limit') limit?: string,
  ) {
    const bId = businessId ?? req.user?.business_id;
    return this.leadService.getActivities(bId, limit ? Number(limit) : 40);
  }
}
