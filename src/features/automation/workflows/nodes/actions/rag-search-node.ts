import { Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/engagement/whatsapp/whatsapp.service";
import { SendMessageType } from "src/features/engagement/whatsapp/dto/whatsapp-message.dto";
import axios from "axios";

interface RAGSearchParams {
    query?: string;  // If not provided, uses user_input
    collection?: string;  // products, docs, etc.
    limit?: number;
    threshold?: number;
    sendResults?: boolean;  // Whether to send results to user as a message
    resultsMessage?: string;  // Template for results message
}

interface RAGSearchResult {
    id: string;
    score: number;
    text: string;
    metadata: Record<string, any>;
}

@Injectable()
export class RAGSearchNode extends ActionNode<RAGSearchParams, RAGSearchResult[]> {
    private ragServiceUrl: string;

    constructor(
        config: NodeConfig<RAGSearchParams>,
        private readonly whatsappService: WhatsAppService
    ) {
        super(config);
        this.ragServiceUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8004';
    }

    protected validateAndParseParams(params: any): RAGSearchParams {
        return {
            query: params.query,
            collection: params.collection || 'products',
            limit: params.limit || 5,
            threshold: params.threshold !== undefined ? params.threshold : 0.4,  // Optimized for short product descriptions (40%)
            sendResults: params.sendResults !== undefined ? params.sendResults : false,
            resultsMessage: params.resultsMessage || 'Here are the most relevant results:'
        };
    }

    shouldWaitForInput(): boolean {
        return false;  // RAG search doesn't wait for input
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<RAGSearchResult[]> {
        const { phoneNumberId, from, business_id } = context;

        // Determine query: use params.query or context.user_input
        const query = this.params.query
            ? this.interpolateString(this.params.query, context)
            : context.user_input;

        if (!query) {
            console.error('RAGSearchNode: No query provided');
            return [];
        }

        console.log(`RAG Search: query="${query}", collection=${this.params.collection}, business_id=${business_id}`);

        try {
            // Call RAG service
            const response = await axios.post(`${this.ragServiceUrl}/api/v1/rag/search`, {
                query: query,
                business_id: business_id,
                collection: this.params.collection,
                limit: this.params.limit,
                threshold: this.params.threshold
            });

            const results: RAGSearchResult[] = response.data.results;
            console.log(`RAG Search: Found ${results.length} results`);

            // Optionally send results to user
            if (this.params.sendResults && results.length > 0) {
                await this.sendResultsToUser(phoneNumberId, from, results, context);
            }

            return results;

        } catch (error) {
            console.error('RAG Search error:', error.message);
            // Return empty results on error
            return [];
        }
    }

    private async sendResultsToUser(
        phoneNumberId: string,
        from: string,
        results: RAGSearchResult[],
        context: WorkflowNodeExecutionContext
    ): Promise<void> {
        // Format results as a message
        const header = this.interpolateString(this.params.resultsMessage, context);

        const formattedResults = results.map((result, index) => {
            const name = result.metadata.name || 'Unknown';
            const price = result.metadata.price ? `₹${result.metadata.price}` : '';
            const category = result.metadata.category || '';
            const score = (result.score * 100).toFixed(0);

            return `${index + 1}. ${name}${price ? ` - ${price}` : ''}${category ? ` (${category})` : ''} [${score}% match]`;
        }).join('\n');

        const message = `${header}\n\n${formattedResults}`;

        await this.whatsappService.sendMessage(phoneNumberId, from, {
            messaging_product: 'whatsapp',
            to: from,
            type: SendMessageType.TEXT,
            text: { body: message }
        });
    }
}
