import { Injectable } from "@nestjs/common";

import { TenantsRepository } from "../infrastructure/tenants.repsoitory.prisma";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly repo: TenantsRepository) {}

  createTenant(dto: CreateTenantDto) {
    return this.repo.create(dto);
  }

  getAllTenants(page = 1, limit = 20) {
    return this.repo.findAll(page, limit);
  }

  getTenantById(id: string) {
    return this.repo.findById(id);
  }

  updateTenant(id: string, dto: UpdateTenantDto) {
    return this.repo.update(id, dto);
  }

  deleteTenant(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
