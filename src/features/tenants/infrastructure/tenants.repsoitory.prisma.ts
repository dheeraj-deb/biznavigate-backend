import { Injectable } from "@nestjs/common";
import { Tenant } from "../domain/entities/tenant.entity";
import { CreateTenantDto } from "../application/dto/create-tenant.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateTenantDto } from "../application/dto/update-tenant.dto";


@Injectable()
export class TenantsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    return this.prisma.tenants.create({ data: dto });
  }

  async findAll(): Promise<Tenant[]> {
    return this.prisma.tenants.findMany();
  }

  async findById(id: string): Promise<Tenant> {
    return this.prisma.tenants.findUnique({ where: { tenant_id: id } });
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    return this.prisma.tenants.update({ where: { tenant_id: id }, data: dto });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenants.delete({ where: { tenant_id: id } });
  }
}
