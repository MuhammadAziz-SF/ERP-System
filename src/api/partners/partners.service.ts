import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerRepository } from '../../core/repository/partner.repository';
import { PartnerType } from '../../core/entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(private readonly partnerRepository: PartnerRepository) {}

  create(createPartnerDto: CreatePartnerDto) {
    return this.partnerRepository.create(createPartnerDto);
  }

  findAll() {
    return this.partnerRepository.findAll({ is_active: true } as any);
  }

  async findOne(id: string) {
    const partner = await this.partnerRepository.findById(id);
    if (!partner) {
      throw new NotFoundException(`Partner #${id} not found`);
    }
    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    const partner = await this.partnerRepository.update(id, updatePartnerDto);
    if (!partner) {
      throw new NotFoundException(`Partner #${id} not found`);
    }
    return partner;
  }

  remove(id: string) {
    return this.partnerRepository.softDelete(id);
  }

  findByType(type: PartnerType) {
    return this.partnerRepository.findByType(type);
  }
}
