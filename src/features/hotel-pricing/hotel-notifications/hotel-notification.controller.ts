import { Controller, Get, Patch, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { HotelNotificationService } from './hotel-notification.service';

@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/notifications')
export class HotelNotificationController {
  constructor(private readonly notificationService: HotelNotificationService) {}

  @Get()
  list(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.notificationService.getNotifications(req.user.business_id, +page, +limit);
  }

  @Get('unread-count')
  unreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.business_id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markRead(req.user.business_id, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead(@Request() req) {
    return this.notificationService.markAllRead(req.user.business_id);
  }
}
