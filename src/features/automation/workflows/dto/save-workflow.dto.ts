import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class InitiateWorkflowDto {
    @IsString()
    workflow_name: string;

    @IsString()
    business_id: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateWorkflowDto {
    @IsString()
    @IsOptional()
    workflow_id?: string;

    @IsString()
    workflow_name: string;

    @IsString()
    business_id: string;

    @IsArray()
    nodes: any[];

    @IsObject()
    connections: Record<string, any>;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    is_active: boolean;
}

export class UpdateWorkflowDto {
    @IsString()
    workflow_id: string;

    @IsString()
    @IsOptional()
    workflow_name?: string;

    @IsArray()
    @IsOptional()
    nodes?: any[];

    @IsObject()
    @IsOptional()
    connections?: Record<string, any>;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    is_active: boolean;
}