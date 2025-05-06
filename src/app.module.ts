import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { OrderModule } from './modules/order/order.module';
// import { ProductModule } from './modules/product/product.module';
// import { CrmModule } from './modules/crm/crm.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'ordersdb',
      autoLoadEntities: true,
      synchronize: true,
    }),
    // WhatsappModule,
    OrderModule,
    // ProductModule,	
    // CrmModule
  ],
})
export class AppModule { }
