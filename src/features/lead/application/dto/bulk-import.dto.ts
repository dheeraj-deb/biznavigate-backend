import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';

/**
 * Bulk Import DTO
 * Used to import multiple leads at once
 */
export class BulkImportDto {
  @ApiProperty({
    description: 'Array of leads to import',
    type: [CreateLeadDto],
    example: [
      {
        source: 'whatsapp',
        business_id: '123e4567-e89b-12d3-a456-426614174000',
        first_name: 'John',
        phone: '9876543210',
      },
      {
        source: 'instagram_dm',
        business_id: '123e4567-e89b-12d3-a456-426614174000',
        first_name: 'Jane',
        email: 'jane@example.com',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLeadDto)
  leads: CreateLeadDto[];
}
