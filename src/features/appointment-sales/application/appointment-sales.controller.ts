import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  AppointmentSalesListingDto,
  AppointmentSalesSlotsQueryDto,
  AppointmentSalesStaffDto,
  AppointmentSalesVisitsQueryDto,
  AssignAppointmentVisitDto,
  CompleteAppointmentSalesSetupDto,
  CreateAppointmentVisitDto,
  UpdateAppointmentListingStatusDto,
  UpdateAppointmentVisitStatusDto,
} from './dto/appointment-sales.dto';
import { AppointmentSalesService } from './appointment-sales.service';

@Controller('appointment-sales')
@UseGuards(JwtAuthGuard)
export class AppointmentSalesController {
  constructor(private readonly appointmentSalesService: AppointmentSalesService) {}

  @Get('overview')
  getOverview(@Req() req: any) {
    return this.appointmentSalesService.getOverview(req.user);
  }

  @Get('setup')
  getSetup(@Req() req: any) {
    return this.appointmentSalesService.getSetup(req.user);
  }

  @Post('setup/complete')
  completeSetup(@Req() req: any, @Body() dto: CompleteAppointmentSalesSetupDto) {
    return this.appointmentSalesService.completeSetup(req.user, dto);
  }

  @Get('listings')
  listListings(@Req() req: any) {
    return this.appointmentSalesService.listListings(req.user);
  }

  @Post('listings')
  upsertListing(@Req() req: any, @Body() dto: AppointmentSalesListingDto) {
    return this.appointmentSalesService.upsertListing(req.user, dto);
  }

  @Patch('listings/:itemId/status')
  updateListingStatus(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateAppointmentListingStatusDto,
  ) {
    return this.appointmentSalesService.updateListingStatus(req.user, itemId, dto);
  }

  @Delete('listings/:itemId')
  deleteListing(@Req() req: any, @Param('itemId') itemId: string) {
    return this.appointmentSalesService.deleteListing(req.user, itemId);
  }

  @Get('staff')
  listStaff(@Req() req: any) {
    return this.appointmentSalesService.listStaff(req.user);
  }

  @Post('staff')
  upsertStaff(@Req() req: any, @Body() dto: AppointmentSalesStaffDto) {
    return this.appointmentSalesService.upsertStaff(req.user, dto);
  }

  @Patch('staff/:staffId')
  updateStaff(@Req() req: any, @Param('staffId') staffId: string, @Body() dto: AppointmentSalesStaffDto) {
    return this.appointmentSalesService.updateStaff(req.user, staffId, dto);
  }

  @Put('staff/:staffId/availability')
  replaceStaffAvailability(
    @Req() req: any,
    @Param('staffId') staffId: string,
    @Body() dto: { availability?: any[] },
  ) {
    return this.appointmentSalesService.replaceStaffAvailability(req.user, staffId, dto.availability ?? []);
  }

  @Get('slots')
  getVisitSlots(@Req() req: any, @Query() query: AppointmentSalesSlotsQueryDto) {
    return this.appointmentSalesService.getVisitSlots(req.user, query);
  }

  @Get('visits')
  listVisits(@Req() req: any, @Query() query: AppointmentSalesVisitsQueryDto) {
    return this.appointmentSalesService.listVisits(req.user, query);
  }

  @Post('visits')
  createVisit(@Req() req: any, @Body() dto: CreateAppointmentVisitDto) {
    return this.appointmentSalesService.createVisit(req.user, dto);
  }

  @Patch('visits/:visitId/status')
  updateVisitStatus(
    @Req() req: any,
    @Param('visitId') visitId: string,
    @Body() dto: UpdateAppointmentVisitStatusDto,
  ) {
    return this.appointmentSalesService.updateVisitStatus(req.user, visitId, dto);
  }

  @Patch('visits/:visitId/assign')
  assignVisit(
    @Req() req: any,
    @Param('visitId') visitId: string,
    @Body() dto: AssignAppointmentVisitDto,
  ) {
    return this.appointmentSalesService.assignVisit(req.user, visitId, dto);
  }
}
