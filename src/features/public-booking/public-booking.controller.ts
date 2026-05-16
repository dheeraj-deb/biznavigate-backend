import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PublicBookingService } from './public-booking.service';

@Controller('public-booking')
export class PublicBookingController {
  constructor(private readonly publicBookingService: PublicBookingService) {}

  @Get(':slug')
  getPage(@Param('slug') slug: string) {
    return this.publicBookingService.getPage(slug);
  }

  @Get(':slug/items')
  getItems(@Param('slug') slug: string, @Query() query: any) {
    return this.publicBookingService.getItems(slug, query);
  }

  @Post(':slug/requests')
  createRequest(@Param('slug') slug: string, @Body() body: any) {
    return this.publicBookingService.createRequest(slug, body);
  }

  @Post(':slug/payment-intent')
  createPaymentIntent(@Param('slug') slug: string, @Body() body: any) {
    return this.publicBookingService.createPaymentIntent(slug);
  }
}
