import { Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/engagement/whatsapp/whatsapp.service";
import { SendMessageType } from "./send-message-node";

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

    validateInput(input: string): boolean {
        if (input === 'exit') return true;
        return this.params.buttons.some(b => b.id === input);
    }

    async reprompt(context: WorkflowNodeExecutionContext): Promise<void> {
        const { phoneNumberId, from } = context;
        await this.whatsappService.sendButtonMessage(
            phoneNumberId, from,
            '⚠️ Please select from the options below:',
            this.buildButtons(),
            undefined, undefined, this.id,
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
        await this.whatsappService.sendButtonMessage(
            phoneNumberId, from, bodyText,
            this.buildButtons(),
            this.params.header, this.params.footer, this.id,
        );
        return 'buttons_sent';
    }

    private buildButtons() {
        const buttons = [...this.params.buttons];
        // WhatsApp max 3 buttons — add Exit only if there's room
        if (buttons.length < 3) {
            buttons.push({ id: 'exit', title: '🚪 Exit' });
        }
        return buttons;
    }
}
