import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from 'src/core/repository/inventory.repository';
import { ProductRepository } from 'src/core/repository/product.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from 'src/core/entities/inventory.entity';
import { Product, ProductSchema } from 'src/core/entities/product.entity';
import { Sale, SaleSchema } from 'src/core/entities/sales.entity';
import {
  PurchaseReceipt,
  PurchaseReceiptSchema,
} from 'src/core/entities/purchase-receipt.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, ProductRepository],
  exports: [InventoryService], // Export so it can be used by Purchase/Sales
})
export class InventoryModule {}
