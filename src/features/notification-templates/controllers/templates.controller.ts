import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { TemplateService } from '../application/services/template.service';
import { TemplateValidationService } from '../application/services/template-validation.service';
import { TemplatePreviewService } from '../application/services/template-preview.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateFilterDto,
  TemplatePreviewDto,
  SendTestNotificationDto,
  CloneTemplateDto,
  BulkTemplateActionDto,
  NotificationChannel,
} from '../application/dto/template.dto';

/**
 * Notification Templates Controller
 * Manages notification templates for multi-channel communication
 */@Controller('notification-templates')
export class TemplatesController {
  private readonly logger = new Logger(TemplatesController.name);

  constructor(
    private readonly templateService: TemplateService,
    private readonly validationService: TemplateValidationService,
    private readonly previewService: TemplatePreviewService,
  ) {}

  /**
   * Create a new notification template
   */
  @Post()  async createTemplate(@Body() dto: CreateTemplateDto) {
    this.logger.log(`Creating template: ${dto.templateKey} for business: ${dto.businessId}`);
    return this.templateService.createTemplate(dto);
  }

  /**
   * List templates with filtering and pagination
   */
  @Get()  async listTemplates(@Query() filters: TemplateFilterDto) {
    this.logger.log(`Listing templates with filters: ${JSON.stringify(filters)}`);
    return this.templateService.listTemplates(filters);
  }

  /**
   * Get template by ID
   */
  @Get(':id')  async getTemplateById(@Param('id') id: string) {
    this.logger.log(`Getting template: ${id}`);
    return this.templateService.getTemplateById(id);
  }

  /**
   * Get template by business and key
   */
  @Get('by-key/:businessId/:key')  async getTemplateByKey(
    @Param('businessId') businessId: string,
    @Param('key') key: string,
  ) {
    this.logger.log(`Getting template by key: ${key} for business: ${businessId}`);
    return this.templateService.getTemplateByKey(businessId, key);
  }

  /**
   * Update template
   */
  @Put(':id')  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    this.logger.log(`Updating template: ${id}`);
    return this.templateService.updateTemplate(id, dto);
  }

  /**
   * Delete template
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  async deleteTemplate(@Param('id') id: string) {
    this.logger.log(`Deleting template: ${id}`);
    await this.templateService.deleteTemplate(id);
  }

  /**
   * Clone template
   */
  @Post('clone')  async cloneTemplate(@Body() dto: CloneTemplateDto) {
    this.logger.log(`Cloning template: ${dto.sourceTemplateId} to ${dto.newTemplateKey}`);
    // TODO: Get userId from JWT token in production
    const userId = 'user-from-jwt-token';
    return this.templateService.cloneTemplate(dto, userId);
  }

  /**
   * Bulk template actions
   */
  @Post('bulk')
  async bulkAction(@Body() dto: BulkTemplateActionDto) {
    this.logger.log(`Bulk action: ${dto.action} on ${dto.templateIds.length} templates`);
    return this.templateService.bulkAction(dto);
  }

  /**
   * Validate template
   */
  @Get(':id/validate')  async validateTemplate(@Param('id') id: string) {
    this.logger.log(`Validating template: ${id}`);
    return this.templateService.validateTemplate(id);
  }

  /**
   * Get template statistics
   */
  @Get(':id/stats')  async getTemplateStats(@Param('id') id: string) {
    this.logger.log(`Getting stats for template: ${id}`);
    return this.templateService.getTemplateStats(id);
  }

  /**
   * Get active templates for business
   */
  @Get('business/:businessId/active')  async getActiveTemplates(
    @Param('businessId') businessId: string,
    @Query('channel') channel?: NotificationChannel,
  ) {
    this.logger.log(
      `Getting active templates for business: ${businessId}${channel ? ` for channel: ${channel}` : ''}`,
    );
    return this.templateService.getActiveTemplatesForBusiness(businessId, channel);
  }

  /**
   * Preview template
   */
  @Post('preview')  async previewTemplate(@Body() dto: TemplatePreviewDto) {
    this.logger.log(`Previewing template: ${dto.templateId} for channel: ${dto.channel}`);
    return this.previewService.previewTemplate(dto);
  }

  /**
   * Get sample preview
   */
  @Get(':id/sample-preview/:channel')  async getSamplePreview(@Param('id') id: string, @Param('channel') channel: NotificationChannel) {
    this.logger.log(`Getting sample preview for template: ${id} on channel: ${channel}`);
    return this.previewService.getSamplePreview(id, channel);
  }

  /**
   * Send test notification
   */
  @Post('test')  async sendTestNotification(@Body() dto: SendTestNotificationDto) {
    this.logger.log(`Sending test notification for template: ${dto.templateId}`);
    return this.previewService.sendTestNotification(dto);
  }

  /**
   * Batch preview
   */
  @Post(':id/batch-preview')  async batchPreview(
    @Param('id') id: string,
    @Body() body: { channel: NotificationChannel; variableSets: Record<string, any>[] },
  ) {
    this.logger.log(`Batch preview for template: ${id} with ${body.variableSets.length} sets`);
    return this.previewService.batchPreview(id, body.channel, body.variableSets);
  }

  /**
   * Compare templates
   */
  @Post('compare')  async compareTemplates(
    @Body()
    body: {
      templateId1: string;
      templateId2: string;
      channel: NotificationChannel;
      variables: Record<string, any>;
    },
  ) {
    this.logger.log(`Comparing templates: ${body.templateId1} vs ${body.templateId2}`);
    return this.previewService.compareTemplates(
      body.templateId1,
      body.templateId2,
      body.channel,
      body.variables,
    );
  }

  /**
   * Export template
   */
  @Get(':id/export')  async exportTemplate(@Param('id') id: string) {
    this.logger.log(`Exporting template: ${id}`);
    return this.previewService.exportTemplate(id);
  }
}
