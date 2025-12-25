import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SalesRepository } from '../../core/repository/sales.repository';
import { InventoryService } from '../inventory/inventory.service';
import { DocumentStatus } from '../../common/enums/erp.enum';
import { Types } from 'mongoose';

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createDto: CreateSaleDto, userId: string) {
    let totalAmount = 0;
    let totalQuantity = 0;

    const items = createDto.items.map((item) => {
      const lineTotal = item.quantity * item.unit_price;
      totalAmount += lineTotal;
      totalQuantity += item.quantity;
      return {
        ...item,
        total_line_price: lineTotal,
        product_id: new Types.ObjectId(item.product_id),
      };
    });

    const data: any = {
      ...createDto,
      items,
      total_amount: totalAmount,
      total_quantity: totalQuantity,
      warehouse_id: createDto.warehouse_id,
      status: DocumentStatus.DRAFT,
    };

    if (createDto.customer_id) {
      data.customer_id = createDto.customer_id;
    }

    return this.salesRepository.createWithAudit(data, userId);
  }

  async findAll() {
    return this.salesRepository.findAll();
  }

  async findOne(id: string) {
    const sale = await this.salesRepository.findById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(id: string, updateDto: UpdateSaleDto, userId: string) {
    const sale = await this.findOne(id);
    if (sale.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only Draft sales can be updated');
    }

    let updateData: any = { ...updateDto };

    if (updateDto.items) {
      let totalAmount = 0;
      let totalQuantity = 0;
      updateData.items = updateDto.items.map((item) => {
        const lineTotal = item.quantity * item.unit_price;
        totalAmount += lineTotal;
        totalQuantity += item.quantity;
        return {
          ...item,
          total_line_price: lineTotal,
          product_id: new Types.ObjectId(item.product_id),
        };
      });
      updateData.total_amount = totalAmount;
      updateData.total_quantity = totalQuantity;
    }

    return this.salesRepository.updateWithAudit(id, updateData, userId);
  }

  async confirm(id: string, userId: string) {
    const sale = await this.findOne(id);
    if (sale.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only Draft sales can be confirmed');
    }

    for (const item of sale.items) {
      await this.inventoryService.decreaseStock(
        item.product_id.toString(),
        sale.warehouse_id,
        item.quantity,
        {
          serial_numbers: item.serial_numbers,
          lot_code: item.lot_code,
        },
      );
    }

    return this.salesRepository.confirmSale(id, userId);
  }

  async cancel(id: string, userId: string, reason: string) {
    const sale = await this.findOne(id);
    if (sale.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Already cancelled');
    }

    if (sale.status === DocumentStatus.CONFIRMED) {
      for (const item of sale.items) {
        await this.inventoryService.increaseStock(
          item.product_id.toString(),
          sale.warehouse_id,
          item.quantity,
          {
            serial_numbers: item.serial_numbers,
            lot_code: item.lot_code,
          },
        );
      }
    }

    return this.salesRepository.cancelSale(id, userId, reason);
  }

  async remove(id: string, userId: string) {
    const sale = await this.findOne(id);
    if (sale.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only Draft sales can be deleted');
    }
    return this.salesRepository.softDelete(id);
  }
}
