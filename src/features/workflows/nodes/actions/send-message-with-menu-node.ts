import { Injectable } from "@nestjs/common";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";
import { ActionNode } from "../base/action-node";
import { SendMessageType } from "./send-message-node";

interface MenuOption {
    id: string;
    label: string;
    description?: string;
}

interface SendMessageWithMenuParams {
    message: string;
    menu: MenuOption[];
}

@Injectable()
export class SendMessageWithMenuNode extends ActionNode<SendMessageWithMenuParams, string> {
    constructor(config: NodeConfig<SendMessageWithMenuParams>, private readonly whatsappService: WhatsAppService) {
        super(config);
    }

    protected validateAndParseParams(params: any): SendMessageWithMenuParams {
        if (!params.message) {
            throw new Error(`SendMessageWithMenuNode ${this.id}: 'message' parameter is required`);
        }

        if (!Array.isArray(params.menu) || params.menu.length === 0) {
            throw new Error(`SendMessageWithMenuNode ${this.id}: 'menu' parameter must be a non-empty array`);
        }

        return {
            message: params.message,
            menu: params.menu
        };
    }

    shouldWaitForInput(): boolean {
        return true;
    }

    validateInput(input: string): boolean {
        if (input === 'exit') return true;
        return this.params.menu.some(o => o.id === input);
    }

    async reprompt(context: WorkflowNodeExecutionContext): Promise<void> {
        const { phoneNumberId, from } = context;
        const sections = [{ title: 'Options', rows: this.buildRows() }];
        await this.whatsappService.sendListMessage(
            phoneNumberId, from,
            '⚠️ Please select from the options below:',
            'Select option', sections, undefined, undefined, this.id,
        );
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

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from } = context;
        const bodyText = this.interpolateString(this.params.message, context);
        const sections = [{ title: 'Options', rows: this.buildRows() }];
        await this.whatsappService.sendListMessage(phoneNumberId, from, bodyText, 'Select option', sections, undefined, undefined, this.id);
        return 'list_sent';
    }

    private buildRows() {
        const rows = this.params.menu.map(option => {
            const row: any = { id: option.id, title: option.label };
            if (option.description) row.description = option.description;
            return row;
        });
        rows.push({ id: 'exit', title: '🚪 Exit Chat' });
        return rows;
    }
}