import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Sale, SaleDocument } from '../entities/sales.entity';

import { Types } from 'mongoose';
import { DocumentStatus } from '../../common/enums/erp.enum';

@Injectable()
export class SalesRepository extends BaseRepository<SaleDocument> {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
  ) {
    super(saleModel);
  }

  async findByStatus(status: DocumentStatus): Promise<SaleDocument[]> {
    return this.findAll({ status } as any);
  }

  async findByCustomer(customerId: string): Promise<SaleDocument[]> {
    return this.findAll({ customer_id: customerId } as any);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<SaleDocument[]> {
    return this.findAll({
      sale_date: { $gte: startDate, $lte: endDate },
    } as any);
  }

  async createWithAudit(
    data: Partial<Sale>,
    userId: string,
  ): Promise<SaleDocument> {
    return this.create({
      ...data,
      created_by: userId,
    } as any);
  }

  async updateWithAudit(
    id: string,
    data: Partial<Sale>,
    userId: string, // Although update usually doesn't change created_by, maybe we track last modified?
    // Sale entity doesn't have updated_by, but has specific status fields.
  ): Promise<SaleDocument | null> {
    // If confirming or cancelling, we have specific fields
    return this.update(id, data as any);
  }

  async confirmSale(id: string, userId: string): Promise<SaleDocument | null> {
    return this.update(id, {
      status: DocumentStatus.CONFIRMED,
      confirmed_by: userId,
      confirmed_at: new Date(),
    } as any);
  }

  async cancelSale(
    id: string,
    userId: string,
    reason: string,
  ): Promise<SaleDocument | null> {
    return this.update(id, {
      status: DocumentStatus.CANCELLED,
      cancelled_by: userId,
      cancelled_at: new Date(),
      cancellation_reason: reason,
    } as any);
  }
}
