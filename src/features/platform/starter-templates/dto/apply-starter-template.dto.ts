import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

export const starterTemplatePhases = ["onboarding", "whatsapp_connected"] as const;
export type StarterTemplatePhase = (typeof starterTemplatePhases)[number];

export class ApplyStarterTemplateDto {
  @IsString()
  template_key: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class StarterTemplateQueryDto {
  @IsString()
  @IsOptional()
  business_type?: string;

  @IsString()
  @IsOptional()
  kind?: string;

  @IsIn(starterTemplatePhases)
  @IsOptional()
  phase?: StarterTemplatePhase;
}

export class ApplyRecommendedStarterTemplatesDto {
  @IsIn(starterTemplatePhases)
  @IsOptional()
  phase?: StarterTemplatePhase;
}
