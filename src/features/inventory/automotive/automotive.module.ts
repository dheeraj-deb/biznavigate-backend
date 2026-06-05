import { Module } from '@nestjs/common';
import { VehicleInventoryService } from './vehicle-inventory.service';
import { VehicleInventoryController } from './vehicle-inventory.controller';
import { LeadModule } from '../../crm/lead/lead.module';

@Module({
  imports: [LeadModule],
  controllers: [VehicleInventoryController],
  providers: [VehicleInventoryService],
  exports: [VehicleInventoryService],
})
export class AutomotiveModule {}
