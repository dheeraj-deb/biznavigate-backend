import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SmartCampaignTriggerService } from '../../crm/lead/application/services/smart-campaign-trigger.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from './dto/vehicle.dto';

@Injectable()
export class VehicleInventoryService {
  private readonly logger = new Logger(VehicleInventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignTrigger: SmartCampaignTriggerService,
  ) {}

  async create(businessId: string, dto: CreateVehicleDto) {
    const vehicle = await this.prisma.vehicle_inventory.create({
      data: {
        business_id: businessId,
        make: dto.make,
        model_name: dto.model_name,
        year: dto.year,
        fuel_type: dto.fuel_type,
        color: dto.color,
        asking_price: dto.asking_price,
        km_driven: dto.km_driven,
        condition: dto.condition ?? 'used',
        images: dto.images ?? [],
        description: dto.description,
        status: 'available',
      },
    });

    // Fire preference-watch matching asynchronously
    void this.campaignTrigger.onNewInventory(businessId, vehicle.vehicle_id);

    return vehicle;
  }

  async findAll(businessId: string, query: VehicleQueryDto) {
    const where: any = { business_id: businessId };

    if (query.status) where.status = query.status;
    else where.status = 'available';

    if (query.make) where.make = { contains: query.make, mode: 'insensitive' };
    if (query.model_name) where.model_name = { contains: query.model_name, mode: 'insensitive' };
    if (query.fuel_type) where.fuel_type = { equals: query.fuel_type, mode: 'insensitive' };
    if (query.budget_max) where.asking_price = { lte: query.budget_max };
    if (query.year_min) where.year = { gte: query.year_min };

    return this.prisma.vehicle_inventory.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(businessId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle_inventory.findFirst({
      where: { vehicle_id: vehicleId, business_id: businessId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(businessId: string, vehicleId: string, dto: UpdateVehicleDto) {
    const existing = await this.findOne(businessId, vehicleId);
    const oldPrice = Number(existing.asking_price);

    const updated = await this.prisma.vehicle_inventory.update({
      where: { vehicle_id: vehicleId },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });

    // If price was reduced, trigger price-drop alerts
    if (dto.asking_price !== undefined && dto.asking_price < oldPrice) {
      void this.campaignTrigger.onPriceDrop(businessId, vehicleId, dto.asking_price);
    }

    return updated;
  }

  async remove(businessId: string, vehicleId: string) {
    await this.findOne(businessId, vehicleId);
    return this.prisma.vehicle_inventory.update({
      where: { vehicle_id: vehicleId },
      data: { status: 'sold', updated_at: new Date() },
    });
  }

  /** Used by AI browse_inventory tool. */
  async search(businessId: string, params: {
    budget_max?: number;
    make?: string;
    model?: string;
    fuel_type?: string;
    year_min?: number;
    limit?: number;
  }) {
    const where: any = { business_id: businessId, status: 'available' };

    if (params.budget_max) where.asking_price = { lte: params.budget_max };
    if (params.fuel_type) where.fuel_type = { equals: params.fuel_type, mode: 'insensitive' };
    if (params.year_min) where.year = { gte: params.year_min };

    // Both make and model → AND; only one → filter on that alone.
    if (params.make) where.make = { contains: params.make, mode: 'insensitive' };
    if (params.model) where.model_name = { contains: params.model, mode: 'insensitive' };

    return this.prisma.vehicle_inventory.findMany({
      where,
      take: params.limit ?? 5,
      orderBy: { asking_price: 'asc' },
    });
  }

  /** Find alternatives within ±20% budget of a given vehicle. */
  async findSimilar(businessId: string, vehicleId: string, limit = 4) {
    const vehicle = await this.findOne(businessId, vehicleId);
    const price = Number(vehicle.asking_price);
    const min = price * 0.8;
    const max = price * 1.2;

    return this.prisma.vehicle_inventory.findMany({
      where: {
        business_id: businessId,
        status: 'available',
        vehicle_id: { not: vehicleId },
        asking_price: { gte: min, lte: max },
      },
      take: limit,
      orderBy: { asking_price: 'asc' },
    });
  }
}
