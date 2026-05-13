import { Controller, Post, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { RazorpayWebhookService } from './razorpay-webhook.service';

@ApiTags('Webhooks')
@Controller('webhooks')
@SkipThrottle()
export class RazorpayWebhookController {
  constructor(private readonly webhookService: RazorpayWebhookService) {}

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook receiver — no JWT, HMAC-SHA256 verified' })
  handleWebhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    // rawBody set by express.json verify in main.ts
    return this.webhookService.processWebhook(req.rawBody ?? Buffer.from(JSON.stringify(req.body)), signature ?? '');
  }
}
