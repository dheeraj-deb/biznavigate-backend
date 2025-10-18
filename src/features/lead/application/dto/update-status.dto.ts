import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Status DTO
 * Used to update lead status with optional reason
 */
export class UpdateStatusDto {
  @ApiProperty({
    description: 'New status for the lead',
    enum: [
      'new',
      'contacted',
      'qualified',
      'proposal_sent',
      'negotiation',
      'won',
      'lost',
      'invalid',
    ],
    example: 'contacted',
  })
  @IsEnum([
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiation',
    'won',
    'lost',
    'invalid',
  ])
  status: string;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    maxLength: 500,
    example: 'Customer responded positively to initial contact',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
