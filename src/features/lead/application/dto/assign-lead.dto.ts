import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Assign Lead DTO
 * Used to assign a lead to an agent
 */
export class AssignLeadDto {
  @ApiProperty({
    description: 'Agent/User ID to assign the lead to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  agent_id: string;

  @ApiPropertyOptional({
    description: 'Reason for assignment',
    maxLength: 255,
    example: 'Best fit based on expertise',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
