import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, InitiateWorkflowDto, UpdateWorkflowDto } from './dto/save-workflow.dto';

@Controller('workflows')
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

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
}