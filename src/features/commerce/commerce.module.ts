import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';

/**
 * Commerce boundary module.
 *
 * This composes the active commerce modules without forcing a physical move of
 * every feature folder in one risky rewrite. Feature modules can keep their
 * existing public imports while new app-level wiring depends on CommerceModule.
 */
@Module({
  imports: [CartModule, CatalogModule, InventoryModule, OrdersModule, PaymentsModule],
  exports: [CartModule, CatalogModule, InventoryModule, OrdersModule, PaymentsModule],
})
export class CommerceModule {}
