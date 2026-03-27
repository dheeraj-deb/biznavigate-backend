import { NodeConfig, WorkflowNodeExecutionContext } from '../../interfaces';
import { ActionNode } from '../base/action-node';
import { WhatsAppService } from 'src/features/whatsapp/whatsapp.service';
import { SendMessageType } from './send-message-node';

interface SendTemplateParams {
  /** Approved Meta template name e.g. "booking_confirmation" */
  template_name: string;
  /** Language code e.g. "en" or "en_US" */
  language: string;
  /**
   * Ordered list of context variable paths mapped to {{1}}, {{2}}, {{3}} ...
   * Supports dot-notation: "contactName", "flow_response.booking_id"
   * Also supports literal strings prefixed with "$": "$Fixed Text"
   */
  variables: string[];
  /**
   * Optional header variable path (maps to header {{1}} if the template has a text header).
   * Leave empty if the template has no header variable.
   */
  header_variable?: string;
}

export class SendTemplateNode extends ActionNode<SendTemplateParams> {
  constructor(
    config: NodeConfig<SendTemplateParams>,
    private readonly whatsappService: WhatsAppService,
  ) {
    super(config);
  }

  protected validateAndParseParams(params: any): SendTemplateParams {
    if (!params.template_name || typeof params.template_name !== 'string') {
      throw new Error(`SendTemplateNode ${this.id}: 'template_name' is required`);
    }
    if (!params.language || typeof params.language !== 'string') {
      throw new Error(`SendTemplateNode ${this.id}: 'language' is required`);
    }
    return {
      template_name: params.template_name,
      language: params.language,
      variables: Array.isArray(params.variables) ? params.variables : [],
      header_variable: params.header_variable ?? '',
    };
  }

  async execute(context: WorkflowNodeExecutionContext): Promise<string> {
    const { phoneNumberId, from, channel } = context;

    const bodyParams = this.params.variables.map((path) => ({
      type: 'text',
      text: this.resolveVariable(path, context),
    }));

    const components: any[] = [];

    if (this.params.header_variable) {
      components.push({
        type: 'header',
        parameters: [
          { type: 'text', text: this.resolveVariable(this.params.header_variable, context) },
        ],
      });
    }

    if (bodyParams.length > 0) {
      components.push({ type: 'body', parameters: bodyParams });
    }

    if (channel === 'whatsapp') {
      await this.whatsappService.sendMessage(
        phoneNumberId,
        from,
        {
          messaging_product: 'whatsapp',
          to: from,
          type: SendMessageType.TEMPLATE,
          template: {
            name: this.params.template_name,
            language: { code: this.params.language },
            components,
          },
        } as any,
        this.id,
      );
    }

    return this.params.template_name;
  }

  /**
   * Resolve a variable path from context.
   * Paths starting with "$" are treated as literals (strip the "$").
   * Otherwise, dot-notation path is resolved from context.
   * Falls back to interpolateString for ${...} style tokens.
   */
  private resolveVariable(path: string, context: WorkflowNodeExecutionContext): string {
    if (path.startsWith('$')) {
      return path.slice(1);
    }
    const value = this.getNestedValue(context, path);
    if (value !== undefined && value !== null) {
      return String(value);
    }
    // Fallback: treat as an interpolation template
    return this.interpolateString(path, context);
  }
}
