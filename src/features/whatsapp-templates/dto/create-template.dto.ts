// dto/create-template.dto.ts
import { Type } from 'class-transformer';
import {
    IsEnum, IsString, IsOptional, IsArray,
    ValidateNested, IsUrl, Matches, MaxLength,
    ValidateIf, IsNotEmpty,
} from 'class-validator';
import { TemplateCategory, HeaderType, ButtonType, ActionType } from '../enums/template.enum';

export class CreateButtonDto {
    @IsEnum(ButtonType)
    type: ButtonType;

    @IsString()
    @MaxLength(25)
    text: string;

    @ValidateIf(o => o.type === ButtonType.QUICK_REPLY)
    @IsString()
    payload?: string;

    @ValidateIf(o => o.type === ButtonType.CALL_TO_ACTION)
    @IsEnum(ActionType)
    actionType?: ActionType;

    @ValidateIf(o => o.actionType === ActionType.PHONE_NUMBER)
    @IsString()
    phoneNumber?: string;

    @ValidateIf(o => o.actionType === ActionType.URL)
    @IsString()
    url?: string;

    // Example value for URL buttons that contain {{1}} variable
    @ValidateIf(o => o.actionType === ActionType.URL)
    @IsString()
    @IsOptional()
    urlExample?: string;
}

export class CreateHeaderDto {
    @IsEnum(HeaderType)
    type: HeaderType;

    @ValidateIf(o => o.type === HeaderType.TEXT)
    @IsString()
    @MaxLength(60)
    text?: string;

    @ValidateIf(o => [HeaderType.IMAGE, HeaderType.VIDEO, HeaderType.DOCUMENT].includes(o.type))
    @IsUrl()
    mediaUrl?: string;

    // Example value for TEXT header with {{1}}, or public media URL for IMAGE/VIDEO/DOCUMENT
    @IsString()
    @IsOptional()
    example?: string;
}

export class CreateComponentsDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateHeaderDto)
    header?: CreateHeaderDto;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1024)
    body: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    footer?: string;

    // Example values for body variables {{1}}, {{2}}, ... in order
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    bodyExamples?: string[];

    // Human-readable descriptions for each body variable in order.
    // e.g. ["Guest name", "Booking reference ID", "Check-in date"]
    // Helps the AI analyzer map variables to the correct context paths.
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    variableDescriptions?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateButtonDto)
    buttons?: CreateButtonDto[];
}

export class CreateTemplateDto {
    @IsString()
    @Matches(/^[a-z0-9_]+$/, { message: 'Name must be lowercase alphanumeric with underscores only' })
    @MaxLength(512)
    name: string;

    @IsEnum(TemplateCategory)
    category: TemplateCategory;

    @IsString()
    @Matches(/^[a-z]{2}(_[A-Z]{2})?$/, { message: 'Language must be BCP-47 code like en, en_US' })
    language: string;

    @ValidateNested()
    @Type(() => CreateComponentsDto)
    components: CreateComponentsDto;
}