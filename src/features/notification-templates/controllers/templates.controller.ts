import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
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

@Controller('notification-templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  private readonly logger = new Logger(TemplatesController.name);

  constructor(
    private readonly templateService: TemplateService,
    private readonly validationService: TemplateValidationService,
    private readonly previewService: TemplatePreviewService,
  ) {}

  @Post()
  async createTemplate(@Body() dto: CreateTemplateDto, @Req() req: any) {
    dto.businessId = req.user.business_id;
    dto.tenantId = req.user.tenant_id;
    this.logger.log(`Creating template: ${dto.templateKey} for business: ${dto.businessId}`);
    return this.templateService.createTemplate(dto);
  }

  @Get()
  async listTemplates(@Query() filters: TemplateFilterDto, @Req() req: any) {
    filters.businessId = req.user.business_id;
    filters.tenantId = req.user.tenant_id;
    return this.templateService.listTemplates(filters);
  }

  @Get(':id')
  async getTemplateById(@Param('id') id: string) {
    return this.templateService.getTemplateById(id);
  }

  @Get('by-key/:businessId/:key')
  async getTemplateByKey(
    @Req() req: any,
    @Param('key') key: string,
  ) {
    return this.templateService.getTemplateByKey(req.user.business_id, key);
  }

  @Put(':id')
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templateService.updateTemplate(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Param('id') id: string) {
    await this.templateService.deleteTemplate(id);
  }

  @Post('clone')
  async cloneTemplate(@Body() dto: CloneTemplateDto, @Req() req: any) {
    return this.templateService.cloneTemplate(dto, req.user.user_id);
  }

  @Post('bulk')
  async bulkAction(@Body() dto: BulkTemplateActionDto) {
    return this.templateService.bulkAction(dto);
  }

  @Get(':id/validate')
  async validateTemplate(@Param('id') id: string) {
    return this.templateService.validateTemplate(id);
  }

  @Get(':id/stats')
  async getTemplateStats(@Param('id') id: string) {
    return this.templateService.getTemplateStats(id);
  }

  @Get('business/:businessId/active')
  async getActiveTemplates(
    @Req() req: any,
    @Query('channel') channel?: NotificationChannel,
  ) {
    return this.templateService.getActiveTemplatesForBusiness(req.user.business_id, channel);
  }

  @Post('preview')
  async previewTemplate(@Body() dto: TemplatePreviewDto) {
    return this.previewService.previewTemplate(dto);
  }

  @Get(':id/sample-preview/:channel')
  async getSamplePreview(@Param('id') id: string, @Param('channel') channel: NotificationChannel) {
    return this.previewService.getSamplePreview(id, channel);
  }

  @Post('test')
  async sendTestNotification(@Body() dto: SendTestNotificationDto) {
    return this.previewService.sendTestNotification(dto);
  }

  @Post(':id/batch-preview')
  async batchPreview(
    @Param('id') id: string,
    @Body() body: { channel: NotificationChannel; variableSets: Record<string, any>[] },
  ) {
    return this.previewService.batchPreview(id, body.channel, body.variableSets);
  }

  @Post('compare')
  async compareTemplates(
    @Body() body: { templateId1: string; templateId2: string; channel: NotificationChannel; variables: Record<string, any> },
  ) {
    return this.previewService.compareTemplates(body.templateId1, body.templateId2, body.channel, body.variables);
  }

  @Get(':id/export')
  async exportTemplate(@Param('id') id: string) {
    return this.previewService.exportTemplate(id);
  }
}
