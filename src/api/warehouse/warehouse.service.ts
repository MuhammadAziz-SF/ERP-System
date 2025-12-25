import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseRepository } from '../../core/repository/warehouse.repository';

@Injectable()
export class WarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  create(createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseRepository.create(createWarehouseDto);
  }

  findAll() {
    return this.warehouseRepository.findAll({ is_active: true } as any);
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse #${id} not found`);
    }
    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.warehouseRepository.update(
      id,
      updateWarehouseDto,
    );
    if (!warehouse) {
      throw new NotFoundException(`Warehouse #${id} not found`);
    }
    return warehouse;
  }

  remove(id: string) {
    return this.warehouseRepository.softDelete(id);
  }
}
