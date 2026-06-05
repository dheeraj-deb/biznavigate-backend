import { Business } from "../domain/entities/business.entity";
import { CreateBusinessDto } from "../application/dto/create-business.dto";
import { UpdateBusinessDto } from "../application/dto/update-business.dto";

export interface BusinessesRepository {
  create(dto: CreateBusinessDto): Promise<Business>;
  findAll(): Promise<Business[]>;
  findById(id: string): Promise<Business>;
  findByTenant(tenant_id: string): Promise<Business[]>;
  update(id: string, dto: UpdateBusinessDto): Promise<Business>;
  delete(id: string): Promise<void>;
}
