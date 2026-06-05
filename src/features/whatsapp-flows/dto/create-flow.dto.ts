import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { FlowCategory } from '../schemas/flow.schema';

export class CreateFlowDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(FlowCategory)
    category: FlowCategory;

    @IsObject()
    @IsOptional()
    flowJson?: Record<string, any>;

    @IsString()
    @IsOptional()
    endpointUri?: string;
}
