import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';

/**
 * Update Lead DTO
 * All fields from CreateLeadDto are optional for updates
 */
export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
