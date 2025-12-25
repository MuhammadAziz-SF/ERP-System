import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SaleSchema } from '../../core/entities/sales.entity';
import { SalesRepository } from '../../core/repository/sales.repository';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Sale', schema: SaleSchema }]),
    InventoryModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
})
export class SalesModule {}
