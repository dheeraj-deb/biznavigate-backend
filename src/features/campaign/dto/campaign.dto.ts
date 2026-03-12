import {
    IsString,
    IsEnum,
    IsOptional,
    IsArray,
    ValidateNested,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsDateString
} from "class-validator";
import { Type } from "class-transformer";
import { AudienceFilterOperator, CampaignStatus, CampaignType } from "../enums/enums";



export class AudienceConditionDto {
    @IsString()
    @IsNotEmpty()
    field: string;

    @IsString()
    @IsNotEmpty()
    operator: string;

    value: any;
}

export class AudienceFilterDto {
    @IsEnum(AudienceFilterOperator)
    @IsOptional()
    operator?: AudienceFilterOperator;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AudienceConditionDto)
    conditions: AudienceConditionDto[];
}

export class TemplateVariableMappingDto {
    @IsNumber()
    variableIndex: number;

    @IsString()
    source: string;
}

export class CampaignScheduleDto {
    @IsDateString()
    sendAt: Date;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsString()
    cronExpression?: string;

    @IsOptional()
    @IsDateString()
    endsAt?: Date;
}

export class CampaignRateLimitDto {
    @IsOptional()
    @IsNumber()
    messagesPerSecond?: number;

    @IsOptional()
    @IsNumber()
    batchSize?: number;
}

export class QueryCampaignDto {
    @IsOptional()
    @IsEnum(CampaignStatus)
    status?: CampaignStatus;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;
}

export class CreateCampaignDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(CampaignType)
    type?: CampaignType;

    @IsMongoId()
    templateId: string;

    @IsString()
    templateLanguage: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TemplateVariableMappingDto)
    variableMappings: TemplateVariableMappingDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => AudienceFilterDto)
    audienceFilter?: AudienceFilterDto;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    explicitPhoneNumbers?: string[];

    @ValidateNested()
    @Type(() => CampaignScheduleDto)
    schedule: CampaignScheduleDto;

}