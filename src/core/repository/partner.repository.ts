import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Partner, PartnerDocument } from '../entities/partner.entity';

import { PartnerType } from '../entities/partner.entity';

@Injectable()
export class PartnerRepository extends BaseRepository<PartnerDocument> {
  constructor(
    @InjectModel(Partner.name)
    private readonly partnerModel: Model<PartnerDocument>,
  ) {
    super(partnerModel);
  }

  async findByType(type: PartnerType): Promise<PartnerDocument[]> {
    // Can match directly or if type is BOTH, it implies it includes BOTH?
    // Usually if I search for CUSTOMER, I want CUSTOMER or BOTH.
    // Implementing exact match for now as per simplicity.
    return this.findAll({ type } as any);
  }

  async searchByName(name: string): Promise<PartnerDocument[]> {
    return this.findAll({
      name: { $regex: name, $options: 'i' },
    } as any);
  }

  async findByPhone(phone: string): Promise<PartnerDocument | null> {
    return this.findOne({ phone } as any);
  }
}
