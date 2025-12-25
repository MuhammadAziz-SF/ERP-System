import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehouseSchema } from '../../core/entities/warehouse.entity';
import { WarehouseRepository } from '../../core/repository/warehouse.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Warehouse', schema: WarehouseSchema }]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService, WarehouseRepository],
  exports: [WarehouseService, WarehouseRepository],
})
export class WarehouseModule {}
