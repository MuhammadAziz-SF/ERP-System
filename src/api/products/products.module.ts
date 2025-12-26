import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/core/entities/product.entity';
import { ProductRepository } from 'src/core/repository/product.repository';
import { Sale, SaleSchema } from 'src/core/entities/sales.entity';
import {
  PurchaseReceipt,
  PurchaseReceiptSchema,
} from 'src/core/entities/purchase-receipt.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: PurchaseReceipt.name, schema: PurchaseReceiptSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
})
export class ProductsModule {}
