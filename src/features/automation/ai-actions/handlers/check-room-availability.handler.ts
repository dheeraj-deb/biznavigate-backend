import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HospitalityAvailabilityService } from '../../../industries/hospitality/bookings/application/services/hospitality-availability.service';
import { LeadCommandService } from '../../../crm/lead/application/services/lead-command.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class CheckRoomAvailabilityHandler implements AiActionHandler {
  readonly action = 'check_room_availability' as const;
  private readonly logger = new Logger(CheckRoomAvailabilityHandler.name);

  constructor(
    private readonly availabilityService: HospitalityAvailabilityService,
    private readonly leadCommands: LeadCommandService,
  ) {}

  async execute(dto: ExecuteAiActionDto) {
    const itemId = dto.params.item_id;
    const checkIn = dto.params.check_in;
    const checkOut = dto.params.check_out;

    if (!itemId || !checkIn || !checkOut) {
      throw new BadRequestException('item_id, check_in, and check_out are required');
    }

    const summary = await this.availabilityService.checkAvailability({
      businessId: dto.business_id,
      itemId,
      checkIn,
      checkOut,
      requestedUnits: dto.params.room_count ?? dto.params.rooms ?? dto.params.units ?? dto.params.quantity,
    });

    if (dto.lead_id) {
      await this.leadCommands.recordResortAvailabilityCheck({
        leadId: dto.lead_id,
        businessId: dto.business_id,
        itemId: summary.item.item_id,
        itemName: summary.item.name,
        checkIn: summary.dateRange.checkIn,
        checkOut: summary.dateRange.checkOut,
        guests: dto.params.guests,
        requestedUnits: summary.requestedUnits,
        available: summary.available,
        availableSlots: summary.availableSlots,
        actor: 'ai',
      }).catch((err) =>
        this.logger.warn(`Could not record resort availability lead event for ${dto.lead_id}: ${err.message}`),
      );
    }

    return {
      item_id: summary.item.item_id,
      item_name: summary.item.name,
      check_in: summary.dateRange.checkIn,
      check_out: summary.dateRange.checkOut,
      nights: summary.dateRange.nights,
      requested_units: summary.requestedUnits,
      total_units: summary.totalUnits,
      available: summary.available,
      available_slots: summary.availableSlots,
      price_per_night: summary.pricePerNight,
      total_amount: summary.totalAmount,
      daily: summary.daily,
    };
  }
}
