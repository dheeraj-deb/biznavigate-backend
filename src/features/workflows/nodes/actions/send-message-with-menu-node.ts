import { Injectable } from "@nestjs/common";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";
import { ActionNode } from "../base/action-node";

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

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from, channel } = context;

        const bodyText = this.interpolateString(this.params.message, context);

        const sections = [{
            title: 'Options',
            rows: this.params.menu.map((option) => {
                const row: any = {
                    id: option.id,
                    title: option.label,
                };
                // Only include description if it's not empty
                if (option.description) {
                    row.description = option.description;
                }
                return row;
            })
        }]

        await this.whatsappService.sendListMessage(phoneNumberId, from, bodyText, 'Select option', sections);

        return 'list_sent'
    }
}