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

  async createWithAudit(
    data: Partial<PurchaseReceipt>,
    userId: string,
  ): Promise<PurchaseReceiptDocument> {
    const creationData = { ...data };
    if (userId) {
      if (Types.ObjectId.isValid(userId)) {
        creationData.created_by = new Types.ObjectId(userId);
      }
    }
    return this.create(creationData as any);
  }

  async updateWithAudit(
    id: string,
    data: Partial<PurchaseReceipt>,
    _userId: string,
  ): Promise<PurchaseReceiptDocument | null> {
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
