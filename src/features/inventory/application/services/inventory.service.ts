import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateServiceDto, SetAvailabilityDto, CreateHoldDto, UpdateStockDto } from '../dto';

/**
 * Inventory/Services module superseded by CatalogModule.
 * All methods throw NotImplementedException.
 */
@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createService(_businessId: string, _tenantId: string, _dto: CreateServiceDto): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async getServices(_businessId: string, _type?: string): Promise<any[]> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async getServiceById(_serviceId: string, _businessId: string): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async updateService(_serviceId: string, _businessId: string, _dto: Partial<CreateServiceDto>): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async deleteService(_serviceId: string, _businessId: string): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async setAvailability(_serviceId: string, _businessId: string, _dto: SetAvailabilityDto): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async getAvailability(_serviceId: string, _from: string, _to: string): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async blockDate(_serviceId: string, _businessId: string, _date: string): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async createHold(_businessId: string, _dto: CreateHoldDto): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async releaseHold(_holdId: string, _businessId: string): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async releaseExpiredHolds(): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async updateProductStock(_productId: string, _businessId: string, _dto: UpdateStockDto): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async updateVariantStock(_variantId: string, _businessId: string, _dto: UpdateStockDto): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async getStockAlerts(_businessId: string, _status?: string): Promise<any[]> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async acknowledgeAlert(_alertId: string, _businessId: string): Promise<any> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async getLowStockAlerts(_businessId: string, _tenantId: string): Promise<any[]> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }

  async getInventoryTurnoverByProduct(_businessId: string, _tenantId: string): Promise<any[]> {
    throw new NotImplementedException('InventoryService superseded by CatalogModule');
  }
}
