import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, InitiateWorkflowDto, UpdateWorkflowDto } from './dto/save-workflow.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

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
