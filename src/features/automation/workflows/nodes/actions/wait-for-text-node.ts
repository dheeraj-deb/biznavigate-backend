import { Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/engagement/whatsapp/whatsapp.service";
import { SendMessageType } from "src/features/engagement/whatsapp/dto/whatsapp-message.dto";

interface WaitForTextParams {
    prompt?: string;
}

@Injectable()
export class WaitForTextNode extends ActionNode<WaitForTextParams, string> {
    constructor(config: NodeConfig<WaitForTextParams>, private readonly whatsappService: WhatsAppService) {
        super(config);
    }

    protected validateAndParseParams(params: any): WaitForTextParams {
        return {
            prompt: params.prompt,
        };
    }

    shouldWaitForInput(): boolean {
        return true;
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from } = context;
        console.log("WaitForTextNode context", context);
        console.log("WaitForTextNode params", this.params);
        if (this.params.prompt) {
            const promptText = this.interpolateString(this.params.prompt, context);
            console.log("promptText", promptText)
            await this.whatsappService.sendMessage(phoneNumberId, from, {
                messaging_product: 'whatsapp',
                to: from,
                type: SendMessageType.TEXT,
                text: { body: promptText },
            }, this.id);
        }

        // Workflow pauses here until user sends text input
        return 'waiting_for_text';
    }
}
