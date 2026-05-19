import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, InitiateWorkflowDto, UpdateWorkflowDto } from './dto/save-workflow.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { findTemplate, WORKFLOW_TEMPLATES } from './templates/workflow-templates';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

    @Get('variables')
    getAvailableVariables(@Query('nodeTypes') nodeTypes?: string) {
        const nodeTypeList = nodeTypes ? nodeTypes.split(',') : [];
        return this.workflowsService.getAvailableVariables(nodeTypeList);
    }

    @Get('nodes')
    getNodeDefinitions(@Query('category') category?: 'trigger' | 'action') {
        let nodes = this.workflowsService.getNodeDefinitions();

        if (category) {
            nodes = nodes.filter((n) => n.category === category);
        }

        const grouped = nodes.reduce(
            (acc, node) => {
                (acc[node.category] ??= []).push(node);
                return acc;
            },
            {} as Record<string, typeof nodes>,
        );

        return { total: nodes.length, nodes, grouped };
    }

    @Post('initiate')
    initiateWorkflow(@Body() dto: InitiateWorkflowDto) {
        return this.workflowsService.initiateWorkflow(dto);
    }

    @Post()
    createWorkflow(@Body() dto: CreateWorkflowDto) {
        return this.workflowsService.createWorkflow(dto);
    }

    @Put()
    updateWorkflow(@Body() dto: UpdateWorkflowDto) {
        return this.workflowsService.updateWorkflow(dto);
    }

    @Get('templates')
    listTemplates(@Query('businessType') businessType?: string) {
        const list = businessType
            ? WORKFLOW_TEMPLATES.filter(
                (t) => t.business_types.length === 0 || t.business_types.includes(businessType.toLowerCase()),
            )
            : WORKFLOW_TEMPLATES;
        // Strip the heavy nodes/connections shape — wizard fetches the full template
        // only when the user picks one. Keeps the picker list lean.
        return list.map(({ nodes: _n, connections: _c, ...meta }) => meta);
    }

    @Get('templates/:templateId')
    getTemplate(@Param('templateId') templateId: string) {
        const template = findTemplate(templateId);
        if (!template) throw new NotFoundException(`Template ${templateId} not found`);
        return template;
    }

    @Post('templates/:templateId/clone')
    cloneTemplate(
        @Param('templateId') templateId: string,
        @Body() body: { business_id: string; workflow_name?: string },
    ) {
        const template = findTemplate(templateId);
        if (!template) throw new NotFoundException(`Template ${templateId} not found`);
        if (!body?.business_id) throw new BadRequestException('business_id is required');
        return this.workflowsService.createWorkflow({
            workflow_name: body.workflow_name || template.name,
            business_id: body.business_id,
            description: template.description,
            nodes: template.nodes,
            connections: template.connections,
            is_active: false,
        });
    }

    @Get('business/:businessId')
    getWorkflowsByBusiness(@Param('businessId') businessId: string) {
        return this.workflowsService.getWorkflowsByBusiness(businessId);
    }

    @Get(':workflowId')
    getWorkflow(@Param('workflowId') workflowId: string) {
        return this.workflowsService.getWorkflow(workflowId);
    }

    @Get(':workflowId/runs')
    listRuns(@Param('workflowId') workflowId: string, @Query('limit') limit?: string) {
        const take = Math.min(Math.max(Number(limit) || 50, 1), 200);
        return this.workflowsService.listExecutions(workflowId, take);
    }

    @Get(':workflowId/runs/:executionId')
    getRunDetail(
        @Param('workflowId') workflowId: string,
        @Param('executionId') executionId: string,
    ) {
        return this.workflowsService.getExecutionDetail(workflowId, executionId);
    }

    @Post(':workflowId/toggle')
    toggleActive(@Param('workflowId') workflowId: string, @Body() body: { is_active: boolean }) {
        return this.workflowsService.setActive(workflowId, !!body?.is_active);
    }

    @Delete(':workflowId')
    deleteWorkflow(@Param('workflowId') workflowId: string) {
        return this.workflowsService.deleteWorkflow(workflowId);
    }
}