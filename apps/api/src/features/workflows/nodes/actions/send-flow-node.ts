import { Injectable } from '@nestjs/common';
import { ActionNode } from '../base/action-node';
import { WorkflowNodeExecutionContext, NodeConfig } from '../../interfaces';
import { WhatsAppService } from 'src/features/whatsapp/whatsapp.service';

interface SendFlowParams {
    flow_id: string;
    body: string;
    cta: string;
    header?: string;
    footer?: string;
    screen?: string;
    flow_token?: string;
}

@Injectable()
export class SendFlowNode extends ActionNode<SendFlowParams, string> {
    constructor(config: NodeConfig<SendFlowParams>, private readonly whatsappService: WhatsAppService) {
        super(config);
    }

    protected validateAndParseParams(params: any): SendFlowParams {
        if (!params.flow_id) {
            throw new Error(`SendFlowNode ${this.id}: 'flow_id' parameter is required`);
        }
        if (!params.body) {
            throw new Error(`SendFlowNode ${this.id}: 'body' parameter is required`);
        }
        if (!params.cta) {
            throw new Error(`SendFlowNode ${this.id}: 'cta' parameter is required`);
        }
        return {
            flow_id: params.flow_id,
            body: params.body,
            cta: params.cta,
            header: params.header,
            footer: params.footer,
            screen: params.screen,
            flow_token: params.flow_token,
        };
    }

    shouldWaitForInput(): boolean {
        return true;
    }

    /**
     * Input is the raw response_json string from the nfm_reply webhook.
     * A valid flow response must be parseable JSON.
     */
    validateInput(input: any): boolean {
        if (input === 'exit') return true;
        // Already parsed/enriched object from resumeWorkflow
        if (typeof input === 'object' && input !== null) return true;
        try {
            JSON.parse(input);
            return true;
        } catch {
            return false;
        }
    }

    async reprompt(context: WorkflowNodeExecutionContext): Promise<void> {
        const { phoneNumberId, from } = context;
        await this.whatsappService.sendFlowMessage(
            phoneNumberId, from,
            '⚠️ Please complete the form to continue.',
            this.params.cta,
            this.params.flow_id,
            this.params.header,
            this.params.footer,
            this.params.screen,
            this.params.flow_token,
            this.id,
        );
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from, business_id } = context;
        const bodyText = this.interpolateString(this.params.body, context);

        // If the agent pre-computed availability data, embed dates into flow_token so INIT pre-fills SELECT_DATES
        const navigateData = context.availability_navigate as { screen: string; data: Record<string, any> } | undefined;

        await this.whatsappService.sendFlowMessage(
            phoneNumberId, from,
            bodyText,
            this.params.cta,
            this.params.flow_id,
            this.params.header,
            this.params.footer,
            undefined,
            this.params.flow_token,
            this.id,
            navigateData
                ? { ...navigateData.data, business_id }
                : (business_id ? { business_id } : undefined),
        );
        return 'flow_sent';
    }
}
