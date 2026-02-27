import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

    @Get('test-execute')
    async testExecute() {

        // await this.workflowsService.executeWorkflow();
        return { status: 'ok' };
    }
}
