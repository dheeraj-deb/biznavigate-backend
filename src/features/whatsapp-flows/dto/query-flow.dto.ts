import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FlowCategory, FlowStatus } from '../schemas/flow.schema';

export class QueryFlowDto {
    @IsEnum(FlowStatus)
    @IsOptional()
    status?: FlowStatus;

    @IsEnum(FlowCategory)
    @IsOptional()
    category?: FlowCategory;

    @IsString()
    @IsOptional()
    search?: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page?: number = 1;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    limit?: number = 20;
}
