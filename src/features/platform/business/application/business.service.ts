import { Injectable, Inject, NotFoundException, BadRequestException, HttpException } from "@nestjs/common";

import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { Business } from "../domain/entities/business.entity";
import { BusinessesRepository } from "../infrastructure/business.repository.interface";
import { BusinessBlueprintSeedService } from "./business-blueprint-seed.service";

@Injectable()
export class BusinessesService {
  constructor(
    @Inject("BusinessesRepository")
    private readonly businessesRepo: BusinessesRepository,
    private readonly businessBlueprints: BusinessBlueprintSeedService,
  ) {}

  async create(dto: CreateBusinessDto): Promise<Business> {
    try {
      return await this.businessesRepo.create(dto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Business[]> {
    try {
      return await this.businessesRepo.findAll();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async findById(id: string): Promise<Business> {
    try {
      const business = await this.businessesRepo.findById(id);
      if (!business) throw new NotFoundException("Business not found");
      return business;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async findByTenant(tenant_id: string): Promise<Business[]> {
    try {
      return await this.businessesRepo.findByTenant(tenant_id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateBusinessDto): Promise<Business> {
    try {
      const updated = await this.businessesRepo.update(id, dto);
      if (!updated) throw new NotFoundException("Business not found");
      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.businessesRepo.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async seedBlueprints(id: string) {
    try {
      return await this.businessBlueprints.seedForBusiness(id, { requireWorkflows: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
