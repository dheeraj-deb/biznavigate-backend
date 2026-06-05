import { Module } from '@nestjs/common';
import { ChatWidgetController } from './chat-widget.controller';
import { ChatWidgetService } from './chat-widget.service';
import { ChatWidgetGateway } from './chat-widget.gateway';
import { LeadModule } from '../lead/lead.module';

@Module({
  imports: [LeadModule],
  controllers: [ChatWidgetController],
  providers: [ChatWidgetService, ChatWidgetGateway],
  exports: [ChatWidgetService, ChatWidgetGateway],
})
export class ChatWidgetModule {}
