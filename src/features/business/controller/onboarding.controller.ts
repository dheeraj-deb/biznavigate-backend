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
@Controller("api/v1/onboarding")
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

    return business;
  }
}
