import { Module } from '@nestjs/common';
import { BookingController } from './application/controllers/booking.controller';
import { HospitalityBookingController } from './application/controllers/hospitality-booking.controller';
import { BookingService } from './application/services/booking.service';
import { HospitalityAvailabilityService } from './application/services/hospitality-availability.service';
import { HospitalityBookingHoldCleanupService } from './application/services/hospitality-booking-hold-cleanup.service';
import { HospitalityBookingCommandService } from './application/services/hospitality-booking-command.service';
import { PrismaModule } from '../../../../prisma/prisma.module';
import { LeadCommandService } from 'src/features/crm/lead/application/services/lead-command.service';
import { LeadPreferenceWatchService } from 'src/features/crm/lead/application/services/lead-preference-watch.service';
import { LeadQualificationService } from 'src/features/crm/lead/application/services/lead-qualification.service';
import { ConversationModule } from 'src/features/crm/conversation/conversation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/features/crm/conversation/schemas/conversations.schema';
import { Message, MessageSchema } from 'src/features/crm/lead/schemas/message.schema';

@Module({
  imports: [PrismaModule, MongooseModule.forFeature([
    { name: Conversation.name, schema: ConversationSchema },
    { name: Message.name, schema: MessageSchema },
  ]),],
  controllers: [BookingController, HospitalityBookingController],
  providers: [
    BookingService,
    HospitalityAvailabilityService,
    HospitalityBookingCommandService,
    HospitalityBookingHoldCleanupService,
    LeadCommandService,
    LeadQualificationService,
    LeadPreferenceWatchService,
  ],
  exports: [BookingService, HospitalityAvailabilityService, HospitalityBookingCommandService, LeadCommandService],
})
export class BookingsModule { }
