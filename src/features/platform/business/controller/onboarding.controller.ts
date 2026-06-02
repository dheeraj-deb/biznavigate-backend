import { Body, Controller, Logger, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateBusinessDto } from "../application/dto/update-business.dto";
import { StarterTemplatesService } from "../../starter-templates/starter-templates.service";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
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
}

@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly starterTemplates: StarterTemplatesService
  ) {}

  @Post("complete")
  async complete(@Request() req, @Body() dto: CompleteOnboardingDto) {
    const { business_id, user_id } = req.user;
    const { employees, ...businessData } = dto;

    const business = await this.prisma.businesses.update({
      where: { business_id },
      data: {
        ...businessData,
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

    let starter_templates: any = null;
    try {
      starter_templates = await this.starterTemplates.applyRecommendedTemplates(business_id, {
        phase: "onboarding",
      });
    } catch (error: any) {
      this.logger.warn(`Starter template install skipped: ${error?.message ?? error}`);
      starter_templates = {
        status: "skipped",
        reason: error?.message ?? "starter_template_install_failed",
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
        starter_templates,
      },
    };
  }
}
