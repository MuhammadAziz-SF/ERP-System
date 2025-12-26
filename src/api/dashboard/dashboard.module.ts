import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SalesRepository } from '../../core/repository/sales.repository';
import { PurchaseReceiptRepository } from '../../core/repository/purchase-receipt.repository';
import { InventoryRepository } from '../../core/repository/inventory.repository';
import { ProductRepository } from '../../core/repository/product.repository';
import { Sale, SaleSchema } from '../../core/entities/sales.entity';
import {
  PurchaseReceipt,
  PurchaseReceiptSchema,
} from '../../core/entities/purchase-receipt.entity';
import {
  Inventory,
  InventorySchema,
} from '../../core/entities/inventory.entity';
import { Product, ProductSchema } from '../../core/entities/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    SalesRepository,
    PurchaseReceiptRepository,
    InventoryRepository,
    ProductRepository,
  ],
})
export class DashboardModule {}
