import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";

import { CreateBusinessDto } from "../application/dto/create-business.dto";
import { UpdateBusinessDto } from "../application/dto/update-business.dto";
import { BusinessesService } from "../application/business.service";

@UseGuards(JwtAuthGuard)
@Controller("businesses")
export class BusinessesController {
  constructor(private readonly service: BusinessesService) {}

  @Post()
  create(@Body() dto: CreateBusinessDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get("settings")
  getSettings(@Req() req) {
    return this.service.findById(req.user.business_id);
  }

  @Get("tenant/:tenant_id")
  findByTenant(@Param("tenant_id") tenant_id: string) {
    return this.service.findByTenant(tenant_id);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBusinessDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
