import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../entities/product.entity';
import { BaseRepository } from '../repository/base.repository';
import { ProductTrackingType } from '../../common/enums/erp.enum';
import { Sale, SaleDocument } from '../entities/sales.entity';
import {
  PurchaseReceipt,
  PurchaseReceiptDocument,
} from '../entities/purchase-receipt.entity';

@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    @InjectModel(PurchaseReceipt.name)
    private readonly purchaseReceiptModel: Model<PurchaseReceiptDocument>,
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
    const productObjectId = new Types.ObjectId(productId);

    const purchaseReceiptCount = await this.purchaseReceiptModel.countDocuments(
      {
        'items.product_id': productObjectId,
      },
    );

    if (purchaseReceiptCount > 0) {
      return true;
    }

    const salesCount = await this.saleModel.countDocuments({
      'items.product_id': productObjectId,
    });

    return salesCount > 0;
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
