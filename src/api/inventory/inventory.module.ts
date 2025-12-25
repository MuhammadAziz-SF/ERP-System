import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from 'src/core/repository/inventory.repository';
import { ProductRepository } from 'src/core/repository/product.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { InventorySchema } from 'src/core/entities/inventory.entity';
import { ProductSchema } from 'src/core/entities/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Inventory', schema: InventorySchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, ProductRepository],
  exports: [InventoryService], // Export so it can be used by Purchase/Sales
})
export class InventoryModule {}
