import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { SubscriptionGuard } from '../../../platform/billing/subscription/subscription.guard';
import { PipelineService } from '../application/services/pipeline.service';

@Controller('pipelines')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
export class PipelineController {
  constructor(private readonly pipelines: PipelineService) {}

  @Get()
  list(@Req() req: any) {
    return this.pipelines.listPipelines(req.user.business_id);
  }

  @Post('ensure-default')
  @HttpCode(HttpStatus.OK)
  ensureDefault(@Req() req: any) {
    return this.pipelines.ensureDefaultPipeline(req.user.business_id);
  }

  @Get(':pipelineId')
  get(@Req() req: any, @Param('pipelineId') pipelineId: string) {
    return this.pipelines.getPipeline(pipelineId, req.user.business_id);
  }

  /** Kanban board view: stages with counts + first N leads per stage. */
  @Get(':pipelineId/board')
  board(
    @Req() req: any,
    @Param('pipelineId') pipelineId: string,
    @Query('perStage') perStage?: string,
  ) {
    return this.pipelines.getBoard(pipelineId, req.user.business_id, perStage ? Number(perStage) : 20);
  }

  @Post()
  create(
    @Req() req: any,
    @Body() body: {
      name: string;
      industry?: 'hospitality' | 'commerce' | 'generic' | 'real_estate' | 'service';
      fromTemplate?: 'hospitality' | 'commerce' | 'generic' | 'real_estate' | 'service';
    },
  ) {
    return this.pipelines.createPipeline({
      businessId: req.user.business_id,
      name: body.name,
      industry: body.industry,
      fromTemplate: body.fromTemplate,
    });
  }

  @Patch(':pipelineId')
  rename(
    @Req() req: any,
    @Param('pipelineId') pipelineId: string,
    @Body() body: { name: string },
  ) {
    return this.pipelines.renamePipeline(pipelineId, req.user.business_id, body.name);
  }

  @Patch(':pipelineId/set-default')
  setDefault(@Req() req: any, @Param('pipelineId') pipelineId: string) {
    return this.pipelines.setDefault(pipelineId, req.user.business_id);
  }

  @Delete(':pipelineId')
  archive(@Req() req: any, @Param('pipelineId') pipelineId: string) {
    return this.pipelines.archivePipeline(pipelineId, req.user.business_id);
  }

  // ── Stages ────────────────────────────────────────────────────────────────

  @Post(':pipelineId/stages')
  addStage(
    @Req() req: any,
    @Param('pipelineId') pipelineId: string,
    @Body() body: { name: string; slug: string; position?: number; color?: string; isWon?: boolean; isLost?: boolean },
  ) {
    return this.pipelines.addStage({
      pipelineId,
      businessId: req.user.business_id,
      name: body.name,
      slug: body.slug,
      position: body.position,
      color: body.color,
      isWon: body.isWon,
      isLost: body.isLost,
    });
  }

  @Patch('stages/:stageId')
  updateStage(
    @Req() req: any,
    @Param('stageId') stageId: string,
    @Body() body: { name?: string; color?: string; isWon?: boolean; isLost?: boolean },
  ) {
    return this.pipelines.updateStage(stageId, req.user.business_id, body);
  }

  @Patch(':pipelineId/stages/reorder')
  reorder(
    @Req() req: any,
    @Param('pipelineId') pipelineId: string,
    @Body() body: { stageOrder: string[] },
  ) {
    return this.pipelines.reorderStages(pipelineId, req.user.business_id, body.stageOrder);
  }

  @Delete('stages/:stageId')
  deleteStage(@Req() req: any, @Param('stageId') stageId: string) {
    return this.pipelines.deleteStage(stageId, req.user.business_id);
  }
}
