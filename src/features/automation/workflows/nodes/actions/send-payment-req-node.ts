import * as crypto from 'crypto';
import { ActionNode } from '../base/action-node';
import { WorkflowNodeExecutionContext, NodeConfig } from '../../interfaces';
import { WhatsAppService } from 'src/features/engagement/whatsapp/application/whatsapp.service';
import { InteractiveSendType, SendMessageType } from 'src/features/engagement/whatsapp/dto/whatsapp-message.dto';

// ── Param types ────────────────────────────────────────────────────────────

interface OrderItem {
    retailer_id: string;
    name: string;
    amount: number;
    quantity: number;
}

interface SendPaymentRequestParams {
    body_text: string;
    header?: string;
    footer?: string;
    currency: string;
    payment_type: 'payment_gateway' | 'upi_intent';
    /** Provider type: 'razorpay' | 'payu' — required for payment_gateway */
    payment_gateway_type?: string;
    payment_configuration_name?: string;
    upi_vpa?: string;
    merchant_name?: string;
    items?: OrderItem[];
}


function toPaise(rupees: number | string | undefined): number {
    const n = parseFloat(String(rupees ?? 0));
    return Math.round((isNaN(n) ? 0 : n) * 100);
}

function buildPaymentSettings(params: SendPaymentRequestParams): any[] {
    if (params.payment_type === 'upi_intent') {
        return [{
            type: 'upi_intent',
            upi_intent: {
                pa: params.upi_vpa,
                merchant_name: params.merchant_name ?? 'Store',
            },
        }];
    }
    return [{
        type: 'payment_gateway',
        payment_gateway: {
            type: params.payment_gateway_type ?? 'razorpay',
            configuration_name: params.payment_configuration_name,
        },
    }];
}


export class SendPaymentRequestNode extends ActionNode<SendPaymentRequestParams, string> {
    constructor(
        config: NodeConfig<SendPaymentRequestParams>,
        private readonly whatsappService: WhatsAppService,
    ) {
        super(config);
    }

    protected validateAndParseParams(params: any): SendPaymentRequestParams {
        if (!params.body_text) {
            throw new Error(`SendPaymentRequestNode ${this.id}: 'body_text' is required`);
        }
        if (!params.payment_type || !['payment_gateway', 'upi_intent'].includes(params.payment_type)) {
            throw new Error(`SendPaymentRequestNode ${this.id}: 'payment_type' must be 'payment_gateway' or 'upi_intent'`);
        }
        if (params.payment_type === 'payment_gateway' && !params.payment_configuration_name) {
            throw new Error(`SendPaymentRequestNode ${this.id}: 'payment_configuration_name' is required for payment_gateway type`);
        }
        if (params.payment_type === 'upi_intent' && !params.upi_vpa) {
            throw new Error(`SendPaymentRequestNode ${this.id}: 'upi_vpa' is required for upi_intent type`);
        }
        return {
            body_text: params.body_text,
            header: params.header,
            footer: params.footer,
            currency: params.currency ?? 'INR',
            payment_type: params.payment_type,
            payment_gateway_type: params.payment_gateway_type,
            payment_configuration_name: params.payment_configuration_name,
            upi_vpa: params.upi_vpa,
            merchant_name: params.merchant_name,
            items: params.items,
        };
    }

    shouldWaitForInput(): boolean {
        return false;
    }

    async execute(context: WorkflowNodeExecutionContext): Promise<string> {
        const { phoneNumberId, from } = context;

        const orderItems = this.resolveItems(context);
        if (orderItems.length === 0) {
            throw new Error(`SendPaymentRequestNode ${this.id}: no order items found`);
        }

        const subtotalPaise = orderItems.reduce((sum, i) => sum + toPaise(i.amount) * (i.quantity || 1), 0);

        if (!subtotalPaise || subtotalPaise <= 0) {
            throw new Error(`SendPaymentRequestNode ${this.id}: total_amount must be greater than 0. Check that each item has a valid 'amount'.`);
        }

        const reference_id = crypto.randomUUID();

        await this.whatsappService.sendMessage(
            phoneNumberId,
            from,
            {
                messaging_product: 'whatsapp',
                to: from,
                type: SendMessageType.INTERACTIVE,
                interactive: {
                    type: InteractiveSendType.ORDER_DETAILS,
                    ...(this.params.header && {
                        header: { type: 'text', text: this.params.header },
                    }),
                    body: { text: this.interpolateString(this.params.body_text, context) },
                    ...(this.params.footer && {
                        footer: { text: this.params.footer },
                    }),
                    action: {
                        name: 'review_and_pay',
                        parameters: {
                            reference_id,
                            type: 'digital-goods',
                            currency: this.params.currency,
                            total_amount: { value: subtotalPaise, offset: 100 },
                            payment_settings: buildPaymentSettings(this.params),
                            order: {
                                status: 'pending',
                                items: orderItems.map(item => ({
                                    retailer_id: item.retailer_id,
                                    name: item.name,
                                    amount: { value: toPaise(item.amount), offset: 100 },
                                    quantity: item.quantity,
                                    sale_amount: { value: toPaise(item.amount), offset: 100 },
                                })),
                                subtotal: { value: subtotalPaise, offset: 100 },
                                tax: { value: 0, offset: 100 },
                            },
                        },
                    },
                },
            } as any,
            this.id,
        );

        return reference_id;
    }

    private resolveItems(context: WorkflowNodeExecutionContext): OrderItem[] {



        const cartInfo = context.cart_info ?? (context as any).catalog_selection;

        const itemList: any[] = cartInfo?.items ?? cartInfo?.product_items ?? [];
        if (Array.isArray(itemList) && itemList.length > 0) {
            return itemList.map((item: any) => ({
                retailer_id: item.product_retailer_id ?? item.retailer_id ?? item.cart_item_id ?? item.id,
                name: item.product_name ?? item.name ?? item.product_retailer_id ?? 'Product',
                amount: item.unit_price ?? item.item_price ?? item.price ?? 0,
                quantity: item.quantity ?? 1,
            }));
        }

        return [];
    }
}