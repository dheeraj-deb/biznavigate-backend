import { IsDateString } from 'class-validator';

export class PauseSubscriptionDto {
  @IsDateString()
  pause_start: string;

  @IsDateString()
  pause_end: string;
}
