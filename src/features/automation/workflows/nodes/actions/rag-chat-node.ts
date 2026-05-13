import { Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { NodeConfig, WorkflowNodeExecutionContext } from "../../interfaces";
import { WhatsAppService } from "src/features/engagement/whatsapp/whatsapp.service";
import { SendMessageType } from "./send-message-node";
import axios from "axios";

type ChatRole = 'user' | 'assistant';

interface ConversationMessage {
    role: ChatRole;
    content: string;
}

interface RAGSearchParams {
    query?: string;
    collection?: string;
    business_id?: string;
    context_limit: number;
    temperature?: number;
    model?: string;
    intent?: string;
    conversation_history: ConversationMessage[];
    sendResults?: boolean;
    resultsMessage?: string;
}

export interface RagResponse<TMetadata = Record<string, any>> {
    answer: string;
    sources: RagSource<TMetadata>[];
    tokens_used: number;
    cached: boolean;
    processing_time_ms: number;
}

export interface RagSource<TMetadata> {
    id: string;
    score: number;
    text: string;
    metadata: TMetadata;
}

export interface ProductMetadata {
    product_id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    business_id: string;
}


@Injectable()
export class RagChatNode extends ActionNode<RAGSearchParams, RagResponse<ProductMetadata> | null> {
    private ragServiceUrl: string;

    constructor(config: NodeConfig<RAGSearchParams>, private readonly whatsappService: WhatsAppService) {
        super(config)
        this.ragServiceUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8004';
    }

    protected validateAndParseParams(params: any): RAGSearchParams {
        console.log("params", params)
        return {
            query: params.query,
            context_limit: params.context_limit,
            business_id: params.business_id,
            collection: params.collection ?? 'products',
            intent: params.intent,
            model: params.model ?? 'gpt-4o-mini',
            temperature: params.temperature ?? 0.7,
            conversation_history: params.conversation_history ?? [],
            sendResults: params.sendResults,
            resultsMessage: params.resultsMessage,
        }
    }

    shouldWaitForInput(): boolean {
        return false;  // RAG search doesn't wait for input
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<RagResponse<ProductMetadata> | null> {
        const { business_id } = context;

        // Determine query: use params.query or context.user_input
        const query = this.params.query
            ? this.interpolateString(this.params.query, context)
            : context.user_input;

        if (!query) {
            console.error('RAGSearchNode: No query provided');
            return null;
        }

        console.log(`RAG Search: query="${query}", collection=${this.params.collection}, business_id=${business_id}`);

        try {
            const intent = context.intent?.intent ?? this.params.intent;

            const response = await axios.post(`${this.ragServiceUrl}/api/v1/rag/chat`, {
                query,
                business_id,
                context_limit: this.params.context_limit,
                collection: this.params.collection,
                intent,
                model: this.params.model,
                temperature: this.params.temperature,
                conversation_history: this.params.conversation_history,
            });

            console.log("obj", {
                query,
                business_id,
                context_limit: this.params.context_limit,
                collection: this.params.collection,
                intent,
                model: this.params.model,
                temperature: this.params.temperature,
                conversation_history: this.params.conversation_history,
            })

            const results: RagResponse<ProductMetadata> = response.data;
            console.dir(response.data, { depth: null });

            if (this.params.sendResults) {
                await this.sendResultsToUser(context, results);
            }

            return results;

        } catch (error) {
            console.error('RAG Search error:', error.message);
            return null;
        }
    }

    private async sendResultsToUser(
        context: WorkflowNodeExecutionContext,
        results: RagResponse<ProductMetadata>,
    ): Promise<void> {
        const { phoneNumberId, from } = context;

        const header = this.params.resultsMessage
            ? this.interpolateString(this.params.resultsMessage, context)
            : '';

        const message = header ? `${header}\n\n${results.answer}` : results.answer;

        await this.whatsappService.sendMessage(phoneNumberId, from, {
            messaging_product: 'whatsapp',
            to: from,
            type: SendMessageType.TEXT,
            text: { body: message },
        }, this.id);
    }
}
