import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateBusinessDto } from "../application/dto/update-business.dto";
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

@ApiTags("Onboarding")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    };
  }
}
