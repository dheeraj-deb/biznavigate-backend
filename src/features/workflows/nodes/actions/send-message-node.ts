import { Inject, Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";

interface SendMessageParams {
    message: string;
}

export enum SendMessageType {
    TEXT = 'text',
    TEMPLATE = 'template',
    INTERACTIVE = 'interactive',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    LOCATION = 'location',
    REACTION = 'reaction',
}

@Injectable()
export class SendMessageNode extends ActionNode<SendMessageParams> {

    constructor(config: NodeConfig<SendMessageParams>, private readonly whatsappService: WhatsAppService) {
        super(config);
    }


    protected validateAndParseParams(params: any): SendMessageParams {
        if (!params.message || typeof params.message !== 'string') {
            throw new Error(`SendMessageNode ${this.id}: 'message' parameter is required`);
        }
        return {
            message: params.message,
        };
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from, channel } = context;
        const messageText = this.interpolateString(this.params.message, context);

        if (channel === 'whatsapp') {
            await this.whatsappService.sendMessage(phoneNumberId, from, {
                messaging_product: 'whatsapp',
                to: from,
                type: SendMessageType.TEXT,
                text: { body: messageText },
            });
        } else if (channel === 'instagram') {
            // Instagram implementation
        }

        return messageText;
    }
}