import { Body, Controller, Logger, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateBusinessDto } from "../application/dto/update-business.dto";
import { buildBusinessAutomationDefaults } from "../domain/business-classification";
import { BusinessBlueprintSeedService } from "../application/business-blueprint-seed.service";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsIn,
  ValidateNested,
} from "class-validator";

class OnboardingEmployeeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

class CompleteOnboardingDto extends UpdateBusinessDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingEmployeeDto)
  employees?: OnboardingEmployeeDto[];

  @IsOptional()
  @IsIn(["business_app", "personal_whatsapp", "new_number", "not_sure"])
  whatsapp_current_usage?: string;

  @IsOptional()
  @IsBoolean()
  whatsapp_safety_acknowledged?: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businessBlueprints: BusinessBlueprintSeedService
  ) {}

  @Post("complete")
  async complete(@Request() req, @Body() dto: CompleteOnboardingDto) {
    const { business_id, user_id } = req.user;
    const {
      employees,
      whatsapp_current_usage,
      whatsapp_safety_acknowledged,
      ...businessData
    } = dto;
    const automationDefaults =
      businessData.business_type !== undefined
        ? buildBusinessAutomationDefaults(businessData.business_type)
        : {};

    const business = await this.prisma.businesses.update({
      where: { business_id },
      data: {
        ...businessData,
        ...automationDefaults,
        ...(employees?.length && {
          business_employees: {
            create: employees,
          },
        }),
      },
      include: { business_employees: true },
    });

    await this.prisma.users.update({
      where: { user_id },
      data: { profile_completed: true },
    });

    await this.prisma.business_settings.upsert({
      where: { business_id },
      update: {
        whatsapp_onboarding: {
          current_usage: whatsapp_current_usage ?? "not_sure",
          safety_acknowledged: Boolean(whatsapp_safety_acknowledged),
          updated_at: new Date().toISOString(),
        },
        updated_at: new Date(),
      },
      create: {
        business_id,
        whatsapp_onboarding: {
          current_usage: whatsapp_current_usage ?? "not_sure",
          safety_acknowledged: Boolean(whatsapp_safety_acknowledged),
          updated_at: new Date().toISOString(),
        },
      },
    });

    let business_blueprints: any = null;
    let blueprintSeeded = business.blueprint_seeded;
    let blueprintSeededAt = business.blueprint_seeded_at;
    try {
      business_blueprints = await this.businessBlueprints.seedForBusiness(business_id);
      blueprintSeeded = business_blueprints.status === "seeded";
      blueprintSeededAt = business_blueprints.blueprint_seeded_at ?? null;
    } catch (error: any) {
      this.logger.warn(`Business blueprint seed skipped: ${error?.message ?? error}`);
      business_blueprints = {
        status: "skipped",
        reason: error?.message ?? "business_blueprint_seed_failed",
      };
    }

    const { business_employees, ...businessFields } = business;

    return {
      success: true,
      data: {
        business: {
          business_id: businessFields.business_id,
          tenant_id: businessFields.tenant_id,
          business_name: businessFields.business_name,
          business_type: businessFields.business_type,
          business_group: businessFields.business_group,
          communication_mode: businessFields.communication_mode,
          blueprint_seeded: blueprintSeeded,
          blueprint_seeded_at: blueprintSeededAt,
          email: businessFields.email,
          phone: businessFields.phone,
          city: businessFields.city,
          country: businessFields.country,
          created_at: businessFields.created_at,
        },
        employees_created: (business_employees ?? []).map((e: any) => ({
          user_id: e.employee_id,
          name: e.name,
          email: e.email ?? null,
          role: e.role ?? null,
          temp_password: e.temp_password ?? null,
        })),
        business_blueprints,
      },
    };
  }
}
