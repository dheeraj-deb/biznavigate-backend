import { DynamicModule, Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { CustomersModule } from './customers/customers.module';
import { ConversationModule } from './conversation/conversation.module';
import { HumanHandoffModule } from './human-handoff/human-handoff.module';
import { InboxModule } from './inbox/inbox.module';
import { GatewayModule } from './inbox/gateway/gateway.module';
import { LeadModule } from './lead/lead.module';

/**
 * CRM boundary module.
 *
 * Contacts and customers are PostgreSQL-backed and can be loaded everywhere.
 * Lead/conversation/inbox/handoff are currently Mongo/realtime-backed, so the
 * app composes them only when MongoDB is enabled.
 */
@Module({
  imports: [ContactsModule, CustomersModule],
  exports: [ContactsModule, CustomersModule],
})
export class CrmModule {
  static withRealtime(): DynamicModule {
    return {
      module: CrmModule,
      imports: [
        ContactsModule,
        CustomersModule,
        LeadModule,
        ConversationModule,
        GatewayModule,
        InboxModule,
        HumanHandoffModule,
      ],
      exports: [
        ContactsModule,
        CustomersModule,
        LeadModule,
        ConversationModule,
        GatewayModule,
        InboxModule,
        HumanHandoffModule,
      ],
    };
  }
}
