import { Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";

interface ButtonOption {
    id: string;
    title: string;
}

interface SendMessageWithButtonsParams {
    message: string;
    buttons: ButtonOption[];
    header?: string;
    footer?: string;
}

@Injectable()
export class SendMessageWithButtonsNode extends ActionNode<SendMessageWithButtonsParams, string> {
    constructor(config: NodeConfig<SendMessageWithButtonsParams>, private readonly whatsappService: WhatsAppService) {
        super(config);
    }

    protected validateAndParseParams(params: any): SendMessageWithButtonsParams {
        if (!params.message) {
            throw new Error(`SendMessageWithButtonsNode ${this.id}: 'message' parameter is required`);
        }

        if (!Array.isArray(params.buttons) || params.buttons.length === 0) {
            throw new Error(`SendMessageWithButtonsNode ${this.id}: 'buttons' parameter must be a non-empty array`);
        }

        if (params.buttons.length > 3) {
            throw new Error(`SendMessageWithButtonsNode ${this.id}: WhatsApp allows a maximum of 3 buttons`);
        }

        return {
            message: params.message,
            buttons: params.buttons,
            header: params.header,
            footer: params.footer,
        };
    }

    shouldWaitForInput(): boolean {
        return true;
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from } = context;

        const bodyText = this.interpolateString(this.params.message, context);

        await this.whatsappService.sendButtonMessage(
            phoneNumberId,
            from,
            bodyText,
            this.params.buttons,
            this.params.header,
            this.params.footer,
        );

        return 'buttons_sent';
    }
}
