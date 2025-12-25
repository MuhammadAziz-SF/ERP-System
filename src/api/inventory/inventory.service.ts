import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryRepository } from '../../core/repository/inventory.repository';
import { ProductRepository } from '../../core/repository/product.repository';
import { ProductTrackingType } from '../../common/enums/erp.enum';
import { Types } from 'mongoose';

export interface TrackingInfo {
  serial_numbers?: string[];
  lot_code?: string;
  expiration_date?: Date;
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async checkAvailability(
    productId: string,
    warehouseId: string,
  ): Promise<number> {
    const inventory = await this.inventoryRepository.findAll({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
    } as any);

    return inventory.reduce((sum, item) => sum + item.quantity, 0);
  }

  async findAll(query: any): Promise<any[]> {
    const filter: any = {};
    if (query.product_id) filter.product_id = new Types.ObjectId(query.product_id);
    if (query.warehouse_id)
      filter.warehouse_id = new Types.ObjectId(query.warehouse_id);

    return this.inventoryRepository.findAll(filter);
  }

  async findByProduct(productId: string) {
    return this.inventoryRepository.findByProduct(productId);
  }

  async findByWarehouse(warehouseId: string) {
    return this.inventoryRepository.findByWarehouse(warehouseId);
  }

  async increaseStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo = {},
  ) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      product.tracking_type === ProductTrackingType.VARIANT &&
      product.is_variant_parent
    ) {
      throw new BadRequestException('Cannot stock variant parent');
    }

    switch (product.tracking_type) {
      case ProductTrackingType.SIMPLE:
        await this._increaseSimple(productId, warehouseId, quantity);
        break;
      case ProductTrackingType.SERIALIZED:
        await this._increaseSerialized(
          productId,
          warehouseId,
          quantity,
          trackingInfo,
        );
        break;
      case ProductTrackingType.LOT_TRACKED:
        await this._increaseLot(productId, warehouseId, quantity, trackingInfo);
        break;
      case ProductTrackingType.EXPIRABLE:
        await this._increaseExpirable(
          productId,
          warehouseId,
          quantity,
          trackingInfo,
        );
        break;
      default:
        await this._increaseSimple(productId, warehouseId, quantity);
    }
  }

  private async _increaseSimple(
    productId: string,
    warehouseId: string,
    quantity: number,
  ) {
    let inventory = await this.inventoryRepository.findOne({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
      serial_number: { $exists: false },
      lot_code: { $exists: false },
      expiration_date: { $exists: false },
    } as any);

    if (inventory) {
      inventory.quantity += quantity;
      await inventory.save();
    } else {
      await this.inventoryRepository.create({
        product_id: new Types.ObjectId(productId),
        warehouse_id: new Types.ObjectId(warehouseId),
        quantity,
      } as any);
    }
  }

  private async _increaseSerialized(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo,
  ) {
    if (
      !trackingInfo.serial_numbers ||
      trackingInfo.serial_numbers.length !== quantity
    ) {
      throw new BadRequestException(
        `Serialized product requires exactly ${quantity} serial numbers`,
      );
    }

    for (const serial of trackingInfo.serial_numbers) {
      const exists = await this.inventoryRepository.findBySerialNumber(serial);
      if (exists) {
        throw new BadRequestException(
          `Serial number ${serial} already exists in inventory`,
        );
      }

      await this.inventoryRepository.create({
        product_id: new Types.ObjectId(productId),
        warehouse_id: new Types.ObjectId(warehouseId),
        quantity: 1,
        serial_number: serial,
      } as any);
    }
  }

  private async _increaseLot(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo,
  ) {
    if (!trackingInfo.lot_code) {
      throw new BadRequestException(
        'Lot Code required for Lot Tracked product',
      );
    }

    let inventory = await this.inventoryRepository.findOne({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
      lot_code: trackingInfo.lot_code,
    } as any);

    if (inventory) {
      inventory.quantity += quantity;
      await inventory.save();
    } else {
      await this.inventoryRepository.create({
        product_id: new Types.ObjectId(productId),
        warehouse_id: new Types.ObjectId(warehouseId),
        quantity,
        lot_code: trackingInfo.lot_code,
      } as any);
    }
  }

  private async _increaseExpirable(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo,
  ) {
    if (!trackingInfo.expiration_date) {
      throw new BadRequestException(
        'Expiration Date required for Expirable product',
      );
    }

    let inventory = await this.inventoryRepository.findOne({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
      expiration_date: trackingInfo.expiration_date,
    } as any);

    if (inventory) {
      inventory.quantity += quantity;
      await inventory.save();
    } else {
      await this.inventoryRepository.create({
        product_id: new Types.ObjectId(productId),
        warehouse_id: new Types.ObjectId(warehouseId),
        quantity,
        expiration_date: trackingInfo.expiration_date,
      } as any);
    }
  }

  async decreaseStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo = {},
  ) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    switch (product.tracking_type) {
      case ProductTrackingType.SIMPLE:
        await this._decreaseSimple(productId, warehouseId, quantity);
        break;
      case ProductTrackingType.SERIALIZED:
        await this._decreaseSerialized(
          productId,
          warehouseId,
          quantity,
          trackingInfo,
        );
        break;
      case ProductTrackingType.LOT_TRACKED:
        await this._decreaseLot(productId, warehouseId, quantity, trackingInfo);
        break;
      case ProductTrackingType.EXPIRABLE:
        await this._decreaseExpirable(
          productId,
          warehouseId,
          quantity,
          trackingInfo,
        );
        break;
      default:
        await this._decreaseSimple(productId, warehouseId, quantity);
    }
  }

  private async _decreaseSimple(
    productId: string,
    warehouseId: string,
    quantity: number,
  ) {
    const inventory = await this.inventoryRepository.findOne({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
      serial_number: { $exists: false },
      lot_code: { $exists: false },
      expiration_date: { $exists: false },
    } as any);

    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}`,
      );
    }

    inventory.quantity -= quantity;
    await inventory.save();
  }

  private async _decreaseSerialized(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo,
  ) {
    if (
      !trackingInfo.serial_numbers ||
      trackingInfo.serial_numbers.length !== quantity
    ) {
      throw new BadRequestException(
        `Must provide exactly ${quantity} serial numbers`,
      );
    }

    for (const serial of trackingInfo.serial_numbers) {
      const inventory = await this.inventoryRepository.findOne({
        product_id: new Types.ObjectId(productId),
        warehouse_id: new Types.ObjectId(warehouseId),
        serial_number: serial,
      } as any);

      if (!inventory) {
        throw new BadRequestException(
          `Serial number ${serial} not found in warehouse`,
        );
      }

      if (inventory.quantity < 1) {
        throw new BadRequestException(`Serial number ${serial} is depleted`);
      }

      await this.inventoryRepository.delete(inventory._id as unknown as string);
    }
  }

  private async _decreaseLot(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo,
  ) {
    if (!trackingInfo.lot_code)
      throw new BadRequestException('Lot Code required');

    const inventory = await this.inventoryRepository.findOne({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
      lot_code: trackingInfo.lot_code,
    } as any);

    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock in lot ${trackingInfo.lot_code}`,
      );
    }

    inventory.quantity -= quantity;
    await inventory.save();
  }

  private async _decreaseExpirable(
    productId: string,
    warehouseId: string,
    quantity: number,
    trackingInfo: TrackingInfo,
  ) {
    if (trackingInfo.expiration_date) {
      const inventory = await this.inventoryRepository.findOne({
        product_id: new Types.ObjectId(productId),
        warehouse_id: new Types.ObjectId(warehouseId),
        expiration_date: trackingInfo.expiration_date,
      } as any);

      if (!inventory || inventory.quantity < quantity) {
        throw new BadRequestException(`Insufficient stock for expiration date`);
      }
      inventory.quantity -= quantity;
      await inventory.save();
      return;
    }

    const batches = await this.inventoryRepository.findAll({
      product_id: new Types.ObjectId(productId),
      warehouse_id: new Types.ObjectId(warehouseId),
      expiration_date: { $exists: true },
    } as any);

    batches.sort(
      (a, b) =>
        new Date(a.expiration_date!).getTime() -
        new Date(b.expiration_date!).getTime(),
    );

    let remaining = quantity;

    for (const batch of batches) {
      if (remaining <= 0) break;

      if (batch.quantity > 0) {
        const take = Math.min(batch.quantity, remaining);
        batch.quantity -= take;
        remaining -= take;
        await batch.save();
      }
    }

    if (remaining > 0) {
      throw new BadRequestException(
        `Insufficient total stock for expirable product (FIFO)`,
      );
    }
  }

}
