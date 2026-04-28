import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RagDocumentDto {
    @IsString()
  text: string;

    @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class IngestDocumentsDto {
    @IsString()
  collection: string;

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RagDocumentDto)
  documents: RagDocumentDto[];
}
