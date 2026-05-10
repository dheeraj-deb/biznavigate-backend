import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { TenantsService } from "../application/tenants.service";
import { CreateTenantDto } from "../application/dto/create-tenant.dto";
import { TenantResponseDto } from "../application/dto/tenant-response.dto";
import { UpdateTenantDto } from "../application/dto/update-tenant.dto";

@UseGuards(JwtAuthGuard)
@Controller("tenants")
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Post()
  async create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    try {
      return await this.service.createTenant(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    try {
      return await this.service.getAllTenants(Number(page ?? 1), Number(limit ?? 20)) as any;
    } catch (error) {
      throw error;
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<TenantResponseDto> {
    try {
      return await this.service.getTenantById(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateTenantDto
  ): Promise<TenantResponseDto> {
    try {
      return await this.service.updateTenant(id, dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<{ success: boolean }> {
    try {
      await this.service.deleteTenant(id);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
