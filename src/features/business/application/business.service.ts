import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";

import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { Business } from "../domain/entities/business.entity";
import { BusinessesRepository } from "../infrastructure/business.repository.interface";

@Injectable()
export class BusinessesService {
  constructor(
    @Inject("BusinessesRepository")
    private readonly businessesRepo: BusinessesRepository
  ) {}

  async create(dto: CreateBusinessDto): Promise<Business> {
    try {
      return await this.businessesRepo.create(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Business[]> {
    try {
      return await this.businessesRepo.findAll();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findById(id: string): Promise<Business> {
    try {
      const business = await this.businessesRepo.findById(id);
      if (!business) throw new NotFoundException("Business not found");
      return business;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findByTenant(tenant_id: string): Promise<Business[]> {
    try {
      return await this.businessesRepo.findByTenant(tenant_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateBusinessDto): Promise<Business> {
    try {
      const updated = await this.businessesRepo.update(id, dto);
      if (!updated) throw new NotFoundException("Business not found");
      return updated;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.businessesRepo.delete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
