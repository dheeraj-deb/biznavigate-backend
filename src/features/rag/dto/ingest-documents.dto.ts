import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RagDocumentDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class IngestDocumentsDto {
  @ApiProperty()
  @IsString()
  collection: string;

  @ApiProperty({ type: [RagDocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RagDocumentDto)
  documents: RagDocumentDto[];
}
