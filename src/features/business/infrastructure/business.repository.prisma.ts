import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateBusinessDto } from "../application/dto/create-business.dto";
import { UpdateBusinessDto } from "../application/dto/update-business.dto";
import { Business } from "../domain/entities/business.entity";
import { BusinessesRepository } from "./business.repository.interface";

@Injectable()
export class BusinessesRepositoryPrisma implements BusinessesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBusinessDto): Promise<Business> {
    const { employees, ...businessData } = dto;
    return this.prisma.businesses.create({
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
  }

  async findAll(): Promise<Business[]> {
    return this.prisma.businesses.findMany({ include: { business_employees: true } });
  }

  async findById(id: string): Promise<Business> {
    return this.prisma.businesses.findUnique({
      where: { business_id: id },
      include: { business_employees: true },
    });
  }

  async findByTenant(tenant_id: string): Promise<Business[]> {
    return this.prisma.businesses.findMany({ where: { tenant_id }, include: { business_employees: true } });
  }

  async update(id: string, dto: UpdateBusinessDto): Promise<Business> {
    return this.prisma.businesses.update({
      where: { business_id: id },
      data: dto,
      include: { business_employees: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.businesses.delete({ where: { business_id: id } });
  }
}
