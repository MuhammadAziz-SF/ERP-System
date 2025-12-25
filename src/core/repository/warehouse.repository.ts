import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Warehouse, WarehouseDocument } from '../entities/warehouse.entity';

@Injectable()
export class WarehouseRepository extends BaseRepository<WarehouseDocument> {
  constructor(
    @InjectModel(Warehouse.name)
    private readonly warehouseModel: Model<WarehouseDocument>,
  ) {
    super(warehouseModel);
  }
}
