import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LeadService } from '../application/services/lead.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  FilterLeadDto,
  AssignLeadDto,
  UpdateStatusDto,
  ConvertLeadDto,
  BulkImportDto,
  StatsFilterDto,
} from '../application/dto';
import { LeadEntity } from '../domain/entities/lead.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Tenant, User } from '../../../common/decorators';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Leads')
@Controller('api/v1/leads')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new lead',
    description: 'Creates a new lead in the system with automatic activity logging',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: LeadEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.create(createLeadDto, tenantId, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all leads with filters',
    description:
      'Retrieves a paginated list of leads with optional filtering by status, source, quality, date range, etc.',
  })
  @ApiPaginatedResponse(LeadEntity)
  async findAll(
    @Query() filterDto: FilterLeadDto,
    @Tenant() tenantId: string,
  ) {
    return this.leadService.findAll(filterDto, tenantId);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get lead statistics',
    description:
      'Retrieves comprehensive statistics including total leads, conversion rate, breakdown by status, source, and quality',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        total_leads: 150,
        converted_leads: 45,
        conversion_rate: '30.00',
        avg_lead_score: 65.5,
        by_status: [
          { status: 'new', count: 30 },
          { status: 'contacted', count: 50 },
        ],
        by_source: [
          { source: 'whatsapp', count: 80 },
          { source: 'instagram_dm', count: 70 },
        ],
        by_quality: [
          { quality: 'hot', count: 40 },
          { quality: 'warm', count: 60 },
        ],
      },
    },
  })
  async getStats(
    @Query() filterDto: StatsFilterDto,
    @Tenant() tenantId: string,
  ) {
    return this.leadService.getStats(filterDto, tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get lead by ID',
    description:
      'Retrieves detailed information about a specific lead including assigned agent, recent activities, and pinned notes',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead found',
    type: LeadEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async findOne(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.leadService.findOne(id, tenantId);
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Get lead activity timeline',
    description:
      'Retrieves chronological timeline of all activities for a specific lead',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Timeline retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async getTimeline(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.leadService.getTimeline(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update lead',
    description:
      'Updates lead information with automatic activity logging. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    type: LeadEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.update(id, updateLeadDto, tenantId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft delete lead',
    description:
      'Performs soft delete on a lead (sets deleted_at timestamp and is_active to false)',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async remove(
    @Param('id') id: string,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.remove(id, tenantId, userId);
  }

  @Post(':id/assign')
  @ApiOperation({
    summary: 'Assign lead to agent',
    description:
      'Assigns a lead to a specific agent/user with automatic activity logging',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead assigned successfully',
    type: LeadEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async assign(
    @Param('id') id: string,
    @Body() assignDto: AssignLeadDto,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.assign(id, assignDto, tenantId, userId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update lead status',
    description:
      'Updates lead status with automatic activity and status history logging',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: LeadEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateStatusDto,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.updateStatus(id, statusDto, tenantId, userId);
  }

  @Post(':id/convert')
  @ApiOperation({
    summary: 'Mark lead as converted',
    description:
      'Marks a lead as converted with conversion value and automatic activity logging',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead converted successfully',
    type: LeadEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async convert(
    @Param('id') id: string,
    @Body() convertDto: ConvertLeadDto,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.convert(id, convertDto, tenantId, userId);
  }

  @Post('bulk-import')
  @ApiOperation({
    summary: 'Bulk import leads',
    description:
      'Imports multiple leads at once. Returns success/failure count and error details.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk import completed',
    schema: {
      example: {
        success: 95,
        failed: 5,
        errors: [
          {
            lead: { first_name: 'John' },
            error: 'Phone number invalid',
          },
        ],
      },
    },
  })
  async bulkImport(
    @Body() bulkImportDto: BulkImportDto,
    @Tenant() tenantId: string,
    @User('user_id') userId: string,
  ) {
    return this.leadService.bulkImport(bulkImportDto, tenantId, userId);
  }
}
