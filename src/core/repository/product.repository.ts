// src/modules/products/repositories/product.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../entities/product.entity';
import { BaseRepository } from '../repository/base.repository';
import { ProductTrackingType } from '../../common/enums/erp.enum';


@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }

  async findBySku(sku: string): Promise<ProductDocument | null> {
    return this.findOne({ sku: sku.toUpperCase() } as any);
  }

  async findByBarcode(barcode: string): Promise<ProductDocument | null> {
    return this.findOne({ barcode } as any);
  }

  async findActiveProducts(): Promise<ProductDocument[]> {
    return this.findAll({ is_active: true } as any);
  }

  async findByTrackingType(
    trackingType: ProductTrackingType,
  ): Promise<ProductDocument[]> {
    return this.findAll({ tracking_type: trackingType } as any);
  }

  async findVariantsByParent(parentId: string): Promise<ProductDocument[]> {
    return this.findAll({ parent_id: new Types.ObjectId(parentId) } as any);
  }

  async createWithAudit(
    data: Partial<Product>,
    userId: string,
  ): Promise<ProductDocument> {
    return this.create({
      ...data,
      created_by: userId,
      created_at: new Date(),
    } as any);
  }

  async updateWithAudit(
    id: string,
    data: Partial<Product>,
    userId: string,
  ): Promise<ProductDocument | null> {
    return this.update(id, {
      ...data,
      updated_by: userId,
      updated_at: new Date(),
    } as any);
  }

  async checkUsageInDocuments(productId: string): Promise<boolean> {
    // TODO: Purchase Receipt va Sales collection'larni tekshirish
    // Hozircha false qaytaramiz
    return false;
  }

  async isParentProduct(productId: string): Promise<boolean> {
    const product = await this.findById(productId);
    return product?.tracking_type === ProductTrackingType.VARIANT;
  }

  async hasVariants(parentId: string): Promise<boolean> {
    const count = await this.count({
      parent_id: new Types.ObjectId(parentId),
    } as any);
    return count > 0;
  }
}
