import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { RazorpayClient } from './razorpay.types';

export const RAZORPAY_CLIENT = 'RAZORPAY_CLIENT';

export const RazorpayProvider: Provider = {
  provide: RAZORPAY_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): RazorpayClient =>
    new Razorpay({
      key_id: config.getOrThrow<string>('RAZORPAY_KEY_ID'),
      key_secret: config.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
    }) as unknown as RazorpayClient,
};
