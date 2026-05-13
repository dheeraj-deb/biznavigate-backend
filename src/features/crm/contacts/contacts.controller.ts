import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ContactsService } from './contacts.service';
import { CreateCustomerDto, QueryCustomerDto } from './dto/contact.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) {}

    @Post()
    create(@Req() req: Request & { user: any }, @Body() dto: CreateCustomerDto) {
        return this.contactsService.create(req.user.business_id, req.user.tenant_id, dto);
    }

    @Get()
    findAll(@Req() req: Request & { user: any }, @Query() query: QueryCustomerDto) {
        return this.contactsService.findAll(req.user.business_id, query);
    }
}
