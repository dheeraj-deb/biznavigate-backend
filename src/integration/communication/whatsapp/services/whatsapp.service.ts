// TODO: Implement whatsapp service logic

import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../classes/message-handler';


// {
//     SmsMessageSid: 'SM41e390ad270f5391f9fc666f78314b02',
//     NumMedia: '0',
//     ProfileName: '~',
//     MessageType: 'text',
//     SmsSid: 'SM41e390ad270f5391f9fc666f78314b02',
//     WaId: '919539192684',
//     SmsStatus: 'received',
//     Body: 'tets',
//     To: 'whatsapp:+14155238886',
//     NumSegments: '1',
//     ReferralNumMedia: '0',
//     MessageSid: 'SM41e390ad270f5391f9fc666f78314b02',
//     AccountSid: 'AC19fa060e5047f5af9b81450edc56838b',
//     From: 'whatsapp:+919539192684',
//     ApiVersion: '2010-04-01'
//   }


@Injectable()
export class WhatsappService {
    constructor(private readonly MessageService: MessageHandler) { }


    async handleWebhook(body: any): Promise<string> {
        const { SmsStatus, Body, From, To } = body;
        if (SmsStatus === 'received') {
            // console.log(`Received message from ${From} to ${To}: ${Body}`);
            await this.MessageService.generateMessage(body);
            await this.MessageService.createShop(body);
        }
        return 'OK';
    }


}
