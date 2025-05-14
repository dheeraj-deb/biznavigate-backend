// TODO: Implement whatsapp controller logic

import { Controller, Get, Post, Body, Param, Delete, Query, Res, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { WhatsappService } from '../services/whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

    @Get('/webhook')
    async verifyWebhook(@Query() query: any): Promise<string> {
        return 'OK  ';
    }

    @Post('/webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() body: any): Promise<string> {
        try {
            return await this.whatsappService.handleWebhook(body);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
