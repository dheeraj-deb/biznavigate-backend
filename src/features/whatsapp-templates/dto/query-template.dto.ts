// dto/query-template.dto.ts
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateCategory, TemplateStatus } from '../enums/template.enum';

export class QueryTemplateDto {
    @IsOptional()
    @IsEnum(TemplateStatus)
    status?: TemplateStatus;

    @IsOptional()
    @IsEnum(TemplateCategory)
    category?: TemplateCategory;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}