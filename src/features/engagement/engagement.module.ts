import { DynamicModule, Module } from '@nestjs/common';
import { CampaignModule } from './campaign/campaign.module';
import { ChatWidgetModule } from './chat-widget/chat-widget.module';
import { GupshupModule } from './gupshup/gupshup.module';
import { InstagramModule } from './instagram/instagram.module';
import { TemplatesModule } from './notification-templates/templates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { WhatsAppTemplatesModule } from './whatsapp-templates/whatsapp-templates.module';

/**
 * Engagement boundary module.
 *
 * Notifications and generic templates are PostgreSQL-backed and safe to load
 * everywhere. Channel modules currently depend on Mongo/realtime infrastructure,
 * so the app composes them only when MongoDB-backed features are enabled.
 */
@Module({
  imports: [NotificationsModule, TemplatesModule],
  exports: [NotificationsModule, TemplatesModule],
})
export class EngagementModule {
  static withChannels(): DynamicModule {
    return {
      module: EngagementModule,
      imports: [
        NotificationsModule,
        TemplatesModule,
        GupshupModule,
        WhatsAppTemplatesModule,
        InstagramModule,
        WhatsAppModule,
        ChatWidgetModule,
        CampaignModule,
      ],
      exports: [
        NotificationsModule,
        TemplatesModule,
        GupshupModule,
        WhatsAppTemplatesModule,
        InstagramModule,
        WhatsAppModule,
        ChatWidgetModule,
        CampaignModule,
      ],
    };
  }
}
