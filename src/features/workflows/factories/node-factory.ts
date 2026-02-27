import { Injectable } from "@nestjs/common";
import { NodeConfig } from "../interfaces";
import { BaseNode } from "../nodes/base/base-node";
import { WhatsAppService } from "src/features/whatsapp/whatsapp.service";
import { WhatsAppCatalogService } from "src/features/whatsapp/services/whatsapp-catalog.service";
import { CartService } from "src/features/cart/application/services/cart.service";
import { WhatsAppIntentTriggerNode } from "../nodes/triggers/whatsapp-intent-trigger-node";
import { SendMessageNode } from "../nodes/actions/send-message-node";
import { SendMessageWithMenuNode } from "../nodes/actions/send-message-with-menu-node";
import { SendCatalogNode } from "../nodes/actions/send-catalog-node";
import { SendMessageWithButtonsNode } from "../nodes/actions/send-message-with-btns.node";
import { WaitForTextNode } from "../nodes/actions/wait-for-text-node";
import { CollectFilterNode } from "../nodes/actions/collect-filter-node";
import { RAGSearchNode } from "../nodes/actions/rag-search-node";

export type NodeConstructor<T extends BaseNode = BaseNode> =
    new (config: NodeConfig, ...deps: any[]) => T;


@Injectable()
export class NodeFactory {
    private nodeRegistry: Map<string, NodeConstructor> = new Map();

    constructor(
        private readonly whatsappService: WhatsAppService,
        private readonly catalogService: WhatsAppCatalogService,
        private readonly cartService: CartService,
    ) {
        this.registerNodeTypes();
    }

    private registerNodeTypes(): void {
        //Triggers
        // this.register('trigger.whatsapp', WhatsAppTriggerNode);
        this.register('trigger.whatsapp.intent', WhatsAppIntentTriggerNode);

        //Actions
        this.register('action.send_message', SendMessageNode);
        this.register('action.send_message_withmenu', SendMessageWithMenuNode);
        this.register('action.send_message_with_btns', SendMessageWithButtonsNode);
        this.register('action.wait_for_text', WaitForTextNode);
        // this.register('action.wait_for_image', WaitForImageNode);
        // this.register('action.wait_for_location', WaitForLocationNode);

        // Filter
        this.register('action.collect_filter', CollectFilterNode);

        // Catalog
        this.register('action.send_catalog', SendCatalogNode);

        // RAG
        this.register('action.rag_search', RAGSearchNode);

        // Payment Actions
        // this.register('action.send_payment', SendPaymentNode);

        // Order Actions
        // this.register('action.fetch_categories', FetchCategoriesNode);
        // this.register('action.handle_category_selection', HandleCategorySelectionNode);
        // this.register('action.view_cart', ViewCartNode);
        // this.register('action.collect_address', CollectAddressNode);
        // this.register('action.save_address', SaveAddressNode);
        // this.register('action.confirm_order', ConfirmOrderNode);
        // this.register('action.place_order', PlaceOrderNode);
    }

    private register(type: string, constructor: NodeConstructor): void {
        this.nodeRegistry.set(type, constructor);
    }

    createNode(nodeConfig: NodeConfig): BaseNode {
        const NodeClass = this.nodeRegistry.get(nodeConfig.type);

        if (!NodeClass) {
            throw new Error(`Unknown node type: ${nodeConfig.type}`);
        }

        // Inject appropriate dependencies based on node type
        const dependencies = this.getDependencies(nodeConfig.type);

        return new NodeClass(nodeConfig, ...dependencies);
    }

    private getDependencies(nodeType: string): any[] {
        if (nodeType.startsWith('trigger.whatsapp') || nodeType.includes('send_message') || nodeType === 'action.wait_for_text' || nodeType === 'action.collect_filter' || nodeType === 'action.rag_search') {
            return [this.whatsappService];
        }
        if (nodeType === 'action.send_catalog') {
            return [this.whatsappService, this.catalogService];
        }
        if (nodeType.includes('cart')) {
            return [this.whatsappService, this.cartService];
        }
        // ... other mappings
        return [];
    }

    hasNodeType(type: string): boolean {
        return this.nodeRegistry.has(type);
    }
}