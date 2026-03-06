import { Injectable } from "@nestjs/common";
import { FilterOption, NodeConfig, WorkflowNodeExecutionContext } from "../../interfaces";
import { ActionNode } from "../base/action-node";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";
import { SendMessageType } from "./send-message-node";

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

    validateInput(input: string): boolean {
        if (input === 'exit') return true;
        if (this.params.optional && (input === 'skip' || input === 'skip_filter')) return true;
        return this.params.filterOptions.some(opt => opt.id === input);
    }

    async reprompt(context: WorkflowNodeExecutionContext): Promise<void> {
        const { phoneNumberId, from } = context;
        const options = this.buildOptions();

        if (this.params.presentationType === 'buttons') {
            const buttons = options.slice(0, 3).map((opt: FilterOption) => ({ id: opt.id, title: opt.label }));
            if (buttons.length < 3) {
                buttons.push({ id: 'exit', title: '🚪 Exit' });
            }
            await this.whatsappService.sendButtonMessage(
                phoneNumberId, from,
                '⚠️ Please select from the options below:',
                buttons, undefined, undefined, this.id,
            );
        } else if (this.params.presentationType === 'list') {
            const rows = [
                ...options.map((opt: FilterOption) => ({ id: opt.id, title: opt.label })),
                { id: 'exit', title: '🚪 Exit Chat' },
            ];
            const sections = [{ title: 'Options', rows }];
            await this.whatsappService.sendListMessage(
                phoneNumberId, from,
                '⚠️ Please select from the options below:',
                'Select', sections, undefined, undefined, this.id,
            );
        }
    }

    private buildOptions(): FilterOption[] {
        const options = [...this.params.filterOptions];
        if (this.params.optional && this.params.skipLabel) {
            options.push({ id: 'skip', label: this.params.skipLabel, filterKey: null, filterValue: null });
        }
        return options;
    }

    async onExit(context: WorkflowNodeExecutionContext): Promise<void> {
        const { phoneNumberId, from } = context;
        await this.whatsappService.sendMessage(phoneNumberId, from, {
            messaging_product: 'whatsapp',
            to: from,
            type: SendMessageType.TEXT,
            text: { body: '👋 Thank you for chatting with us! Feel free to message us anytime.' },
        });
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<any> {
        const { phoneNumberId, from } = context;
        const bodyText = this.interpolateString(this.params.message, context);
        const options = this.buildOptions();

        if (this.params.presentationType === 'buttons') {
            await this.whatsappService.sendButtonMessage(phoneNumberId, from, bodyText, options.slice(0, 3).map((opt: FilterOption) => ({ id: opt.id, title: opt.label })), undefined, undefined, this.id)
        } else if (this.params.presentationType === 'list') {
            const sections = [{
                title: 'Options',
                rows: options.map((opt: FilterOption) => ({ id: opt.id, title: opt.label }))
            }]
            await this.whatsappService.sendListMessage(phoneNumberId, from, bodyText, 'Select', sections, undefined, undefined, this.id)
        }

        return {
            filterDimension: this.params.filterDimension,
            filterOptions: this.params.filterOptions,
        }
    }
}