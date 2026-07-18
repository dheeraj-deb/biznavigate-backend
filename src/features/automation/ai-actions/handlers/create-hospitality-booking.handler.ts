import { BadRequestException, Injectable } from '@nestjs/common';
import { HospitalityBookingCommandService } from '../../../industries/hospitality/bookings/application/services/hospitality-booking-command.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class CreateHospitalityBookingHandler implements AiActionHandler {
  readonly action = 'create_hospitality_booking' as const;

  constructor(private readonly hospitalityBookingCommandService: HospitalityBookingCommandService) {}

  async execute(dto: ExecuteAiActionDto) {
    const serviceId = dto.params.service_id ?? dto.params.item_id;
    if (!serviceId || !dto.params.check_in || !dto.params.check_out) {
      throw new BadRequestException('service_id/item_id, check_in, and check_out are required');
    }

    return this.hospitalityBookingCommandService.createBooking({
      business_id: dto.business_id,
      service_id: serviceId,
      check_in: dto.params.check_in,
      check_out: dto.params.check_out,
      guest_name: dto.params.guest_name,
      phone: dto.params.phone,
      customer_phone: dto.params.customer_phone,
      lead_id: dto.lead_id ?? dto.params.lead_id,
      num_guests: dto.params.num_guests ?? dto.params.guests,
      room_count: dto.params.room_count ?? dto.params.rooms ?? dto.params.units ?? dto.params.quantity,
      age: dto.params.age,
      address: dto.params.address,
      pin_code: dto.params.pin_code,
      source: 'ai_action_router',
      actor: 'ai',
    });
  }
}
