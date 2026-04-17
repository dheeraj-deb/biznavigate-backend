import { Injectable } from "@nestjs/common";

import { Tenant } from "../domain/entities/tenant.entity";
import { TenantsRepository } from "../infrastructure/tenants.repsoitory.prisma";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly repo: TenantsRepository) {}

  createTenant(dto: CreateTenantDto): Promise<Tenant> {
    return this.repo.create(dto);
  }

  getAllTenants(): Promise<Tenant[]> {
    return this.repo.findAll();
  }

  getTenantById(id: string): Promise<Tenant> {
    return this.repo.findById(id);
  }

  updateTenant(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    return this.repo.update(id, dto);
  }

  deleteTenant(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
