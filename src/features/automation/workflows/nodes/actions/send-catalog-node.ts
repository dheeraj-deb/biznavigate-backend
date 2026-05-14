import { Injectable } from "@nestjs/common";
import { ActionNode } from "../base/action-node";
import { WorkflowNodeExecutionContext, NodeConfig } from "../../interfaces";
import { WhatsAppService } from "src/features/engagement/whatsapp/application/whatsapp.service";
import { WhatsAppCatalogService } from "src/features/engagement/whatsapp/application/catalog/whatsapp-catalog.service";
import { InteractiveSendType, SendMessageType } from "src/features/engagement/whatsapp/dto/whatsapp-message.dto";

interface SendCatalogParams {
    header?: string;
    message?: string;
    footer?: string;
    limit?: number;
    applyFilters?: boolean;
}

@Injectable()
export class SendCatalogNode extends ActionNode<SendCatalogParams, string> {
    constructor(config: NodeConfig<SendCatalogParams>, private readonly whatsappService: WhatsAppService, private readonly catalogService: WhatsAppCatalogService) {
        super(config);
    }

    protected validateAndParseParams(params: any): SendCatalogParams {
        return {
            header: params.header || 'Our Products',
            message: params.message || 'Browse our catalog below:',
            footer: params.footer,
            limit: params.limit || 10,
            applyFilters: params.applyFilters || false,
        };
    }

    shouldWaitForInput(): boolean {
        return true;
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from, channel, business_id } = context;

        console.log('Apply filters ===== >', this.params.applyFilters);
        console.log('Context filters: ==== >' , context.filters);

        // Build database filters from context
        const dbFilters: Record<string, any> = {};
        if (this.params.applyFilters && context.filters) {
            for (const [dimension, filterData] of Object.entries(context.filters)) {
                if (filterData.filterKey && filterData.filterValue !== null) {
                    dbFilters[filterData.filterKey] = filterData.filterValue;
                }
            }
            console.log('Database filters:', dbFilters);
        }

        // Fetch filtered products from database
        let products = await this.catalogService.getCatalogProducts(business_id, dbFilters);
        console.log('Products from database:', products.length);

        const hasActiveFilters = Object.keys(dbFilters).length > 0;

        // No results for the applied filter — notify user and fall back to full catalog
        if (hasActiveFilters && products.length === 0) {
            await this.whatsappService.sendMessage(phoneNumberId, from, {
                messaging_product: 'whatsapp',
                to: from,
                type: SendMessageType.TEXT,
                text: { body: '😕 No products found for your selected filter. Showing all available products instead:' },
            });
            products = await this.catalogService.getCatalogProducts(business_id, {});
            console.log('Fallback products from database:', products.length);
        }

        const limitedProducts = products.slice(0, this.params.limit);

        const catalogSections = [{
            title: 'Available Products',
            product_items: limitedProducts.map(product => ({
                product_retailer_id: (product as any).item_id,
            }))
        }]

        await this.whatsappService.sendMessage(phoneNumberId, from, {
            messaging_product: 'whatsapp',
            to: from,
            type: SendMessageType.INTERACTIVE,
            interactive: {
                type: InteractiveSendType.PRODUCT_LIST,
                header: {
                    type: 'text',
                    text: this.params.header,
                },
                body: { text: this.interpolateString(this.params.message ?? '', context) },
                action: {
                    catalog_id: await this.catalogService.getCatalogId(business_id),
                    sections: catalogSections,
                },
            }
        })

        return 'catalog_sent';
    }
}