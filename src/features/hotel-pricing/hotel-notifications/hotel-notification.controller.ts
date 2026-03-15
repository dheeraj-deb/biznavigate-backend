import { Controller, Get, Patch, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { HotelNotificationService } from './hotel-notification.service';

@ApiTags('Hotel Pricing — Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hotel-pricing/notifications')
export class HotelNotificationController {
  constructor(private readonly notificationService: HotelNotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List hotel pricing notifications for this organisation (newest first)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  list(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.notificationService.getNotifications(req.user.business_id, +page, +limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread hotel pricing notifications' })
  unreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.business_id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markRead(req.user.business_id, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Request() req) {
    return this.notificationService.markAllRead(req.user.business_id);
  }
}
