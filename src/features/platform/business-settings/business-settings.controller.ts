import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { BusinessSettingsService, UpdateBusinessSettingsDto } from './business-settings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('business-settings')
@UseGuards(JwtAuthGuard)
export class BusinessSettingsController {
  constructor(private readonly settingsService: BusinessSettingsService) {}

  @Get()
  async getSettings(@Req() req: any) {
    return this.settingsService.getSettings(req.user.business_id);
  }

  @Patch()
  async updateSettings(@Req() req: any, @Body() dto: UpdateBusinessSettingsDto) {
    return this.settingsService.updateSettings(req.user.business_id, dto);
  }

  @Get('booking-methods')
  async getBookingMethods(@Req() req: any) {
    return this.settingsService.getBookingMethods(req.user.business_id);
  }

  @Patch('booking-methods')
  async updateBookingMethods(@Req() req: any, @Body() dto: UpdateBusinessSettingsDto['booking_methods']) {
    return this.settingsService.updateBookingMethods(req.user.business_id, dto ?? {});
  }
}
