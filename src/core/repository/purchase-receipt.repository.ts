import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import {
  PurchaseReceipt,
  PurchaseReceiptDocument,
} from '../entities/purchase-receipt.entity';

import { Types } from 'mongoose';
import { DocumentStatus } from '../../common/enums/erp.enum';

@Injectable()
export class PurchaseReceiptRepository extends BaseRepository<PurchaseReceiptDocument> {
  constructor(
    @InjectModel(PurchaseReceipt.name)
    private readonly purchaseReceiptModel: Model<PurchaseReceiptDocument>,
  ) {
    super(purchaseReceiptModel);
  }

  async findByStatus(
    status: DocumentStatus,
  ): Promise<PurchaseReceiptDocument[]> {
    return this.findAll({ status } as any);
  }

  async findBySupplier(supplierId: string): Promise<PurchaseReceiptDocument[]> {
    return this.findAll({ supplier_id: new Types.ObjectId(supplierId) } as any);
  }

  async createWithAudit(
    data: Partial<PurchaseReceipt>,
    userId: string,
  ): Promise<PurchaseReceiptDocument> {
    const creationData = { ...data };
    if (userId) {
      // Check if schema expects ObjectId or String for created_by.
      // Entity definition has @Prop({ type: Types.ObjectId, ref: 'User' }) created_by.
      // So we try casting. If userId is 'system', this will fail.
      // We should handle 'system' or ensure valid ObjectId.
      // The service passes 'system' mock.
      // Ideally, the mock ID should be a valid ObjectId or we change schema to String.
      // For now, let's assume valid ID is passed or handle gracefully.
      // If 'system', we might skip setting it if strict.
      if (Types.ObjectId.isValid(userId)) {
        creationData.created_by = new Types.ObjectId(userId);
      }
    }
    return this.create(creationData as any);
  }

  async updateWithAudit(
    id: string,
    data: Partial<PurchaseReceipt>,
    userId: string,
  ): Promise<PurchaseReceiptDocument | null> {
    // Just generic update, maybe tracking updated_by if we add it later
    return this.update(id, data as any);
  }

  async confirmReceipt(
    id: string,
    userId: string,
  ): Promise<PurchaseReceiptDocument | null> {
    return this.update(id, {
      status: DocumentStatus.CONFIRMED,
      confirmed_by: userId,
      confirmed_at: new Date(),
    } as any);
  }

  async cancelReceipt(
    id: string,
    userId: string,
    reason: string,
  ): Promise<PurchaseReceiptDocument | null> {
    return this.update(id, {
      status: DocumentStatus.CANCELLED,
      cancelled_by: userId,
      cancelled_at: new Date(),
      cancellation_reason: reason,
    } as any);
  }
}
