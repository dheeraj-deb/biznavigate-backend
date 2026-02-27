import { Injectable } from "@nestjs/common";
import { FilterOption, NodeConfig, WorkflowNodeExecutionContext } from "../../interfaces";
import { ActionNode } from "../base/action-node";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";

interface CollectFilterParams {
    filterDimension: string;
    message: string;
    presentationType: 'buttons' | 'list' | 'menu';
    filterOptions: FilterOption[];
    multiSelect?: boolean;
    optional?: boolean;
    skipLabel?: string;
}


@Injectable()
export class CollectFilterNode extends ActionNode<CollectFilterParams, any> {
    constructor(
        config: NodeConfig<CollectFilterParams>,
        private readonly whatsappService: WhatsAppService
    ) {
        super(config);
    }

    protected validateAndParseParams(params: any): CollectFilterParams {
        if (!params.filterDimension || !params.message || !params.filterOptions) {
            throw new Error('filterDimension, message, and filterOptions are required');
        }

        return {
            filterDimension: params.filterDimension,
            message: params.message,
            presentationType: params.presentationType || 'buttons',
            filterOptions: params.filterOptions,
            multiSelect: params.multiSelect || false,
            optional: params.optional || false,
            skipLabel: params.skipLabel || 'Skip',
        }
    }

    shouldWaitForInput(): boolean {
        return true;
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<any> {
        const { phoneNumberId, from } = context;
        const bodyText = this.interpolateString(this.params.message, context);

        const options = [...this.params.filterOptions];
        if (this.params.optional && this.params.skipLabel) {
            options.push({
                id: 'skip',
                label: this.params.skipLabel,
                filterKey: null,
                filterValue: null
            })
        }

        if (this.params.presentationType === 'buttons') {
            await this.whatsappService.sendButtonMessage(phoneNumberId, from, bodyText, options.slice(0, 3).map(opt => ({ id: opt.id, title: opt.label })))
        } else if (this.params.presentationType === 'list') {
            const sections = [{
                title: 'Options',
                rows: options.map(opt => ({
                    id: opt.id,
                    title: opt.label,
                }))
            }]
            await this.whatsappService.sendListMessage(phoneNumberId, from, bodyText, 'Select', sections)
        }

        return {
            filterDimension: this.params.filterDimension,
            filterOptions: this.params.filterOptions,
        }
    }
}