import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { UsersModule } from './users/users.module';
import { PurchaseReceiptsModule } from './purchase-receipts/purchase-receipts.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { SalesModule } from './sales/sales.module';
import { PartnersModule } from './partners/partners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    InventoryModule,
    UsersModule,
    PurchaseReceiptsModule,
    WarehouseModule,
    SalesModule,
    PartnersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
