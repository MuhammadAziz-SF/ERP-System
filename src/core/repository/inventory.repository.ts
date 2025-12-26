import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Inventory, InventoryDocument } from '../entities/inventory.entity';

import { Types } from 'mongoose';

@Injectable()
export class InventoryRepository extends BaseRepository<InventoryDocument> {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {
    super(inventoryModel);
  }

  async findByProduct(productId: string): Promise<InventoryDocument[]> {
    return this.findAll({ product_id: new Types.ObjectId(productId) } as any);
  }

  async findByWarehouse(warehouseId: string): Promise<InventoryDocument[]> {
    return this.findAll({
      warehouse_id: new Types.ObjectId(warehouseId),
    } as any);
  }

  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<InventoryDocument | null> {
    return this.findOne({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
    } as any);
  }

  async findBySerialNumber(
    serialNumber: string,
  ): Promise<InventoryDocument | null> {
    return this.findOne({ serial_number: serialNumber } as any);
  }

  async getTotalStockInitial(productId: string): Promise<number> {
    const result = await this.inventoryModel.aggregate([
      { $match: { product_id: new Types.ObjectId(productId) } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    return result[0]?.total || 0;
  }
}
