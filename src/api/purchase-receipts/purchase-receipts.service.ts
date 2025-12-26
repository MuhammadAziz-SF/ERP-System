import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { UpdatePurchaseReceiptDto } from './dto/update-purchase-receipt.dto';
import { PurchaseReceiptRepository } from '../../core/repository/purchase-receipt.repository';
import { InventoryService } from '../inventory/inventory.service';
import { DocumentStatus } from '../../common/enums/erp.enum';
import { Types } from 'mongoose';

@Injectable()
export class PurchaseReceiptsService {
  constructor(
    private readonly purchaseReceiptRepository: PurchaseReceiptRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createDto: CreatePurchaseReceiptDto, userId: string) {
    let totalAmount = 0;
    let totalQuantity = 0;

    const items = createDto.items.map((item) => {
      const lineTotal = item.quantity * item.unit_price;
      totalAmount += lineTotal;
      totalQuantity += item.quantity;
      return {
        ...item,
        total_line_cost: lineTotal,
        product_id: new Types.ObjectId(item.product_id),
      };
    });

    const data: any = {
      ...createDto,
      items,
      total_amount: totalAmount,
      total_quantity: totalQuantity,
      supplier_id: new Types.ObjectId(createDto.supplier_id),
      warehouse_id: new Types.ObjectId(createDto.warehouse_id),
      status: DocumentStatus.DRAFT,
    };

    return this.purchaseReceiptRepository.createWithAudit(data, userId);
  }

  async findAll() {
    return this.purchaseReceiptRepository.findAll();
  }

  async findOne(id: string) {
    const receipt = await this.purchaseReceiptRepository.findById(id);
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async update(
    id: string,
    updateDto: UpdatePurchaseReceiptDto,
    userId: string,
  ) {
    const receipt = await this.findOne(id);
    if (receipt.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only Draft receipts can be updated');
    }

    const updateData: any = { ...updateDto };

    if (updateDto.items) {
      let totalAmount = 0;
      let totalQuantity = 0;
      updateData.items = updateDto.items.map((item) => {
        const lineTotal = item.quantity * item.unit_price;
        totalAmount += lineTotal;
        totalQuantity += item.quantity;
        return {
          ...item,
          total_line_cost: lineTotal,
          product_id: new Types.ObjectId(item.product_id),
        };
      });
      updateData.total_amount = totalAmount;
      updateData.total_quantity = totalQuantity;
    }

    if (updateDto.supplier_id)
      updateData.supplier_id = new Types.ObjectId(updateDto.supplier_id);
    if (updateDto.warehouse_id)
      updateData.warehouse_id = new Types.ObjectId(updateDto.warehouse_id);

    return this.purchaseReceiptRepository.updateWithAudit(
      id,
      updateData,
      userId,
    );
  }

  async confirm(id: string, userId: string) {
    const receipt = await this.findOne(id);
    if (receipt.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only Draft receipts can be confirmed');
    }

    for (const item of receipt.items) {
      await this.inventoryService.increaseStock(
        item.product_id.toString(),
        receipt.warehouse_id.toString(),
        item.quantity,
        {
          serial_numbers: item.serial_numbers,
          lot_code: item.lot_code,
          expiration_date: item.expiration_date,
        },
      );
    }
    return this.purchaseReceiptRepository.confirmReceipt(id, userId);
  }

  async cancel(id: string, userId: string, reason: string) {
    const receipt = await this.findOne(id);
    if (receipt.status === DocumentStatus.CANCELLED) {
      throw new BadRequestException('Already cancelled');
    }

    if (receipt.status === DocumentStatus.CONFIRMED) {
      for (const item of receipt.items) {
        await this.inventoryService.decreaseStock(
          item.product_id.toString(),
          receipt.warehouse_id.toString(),
          item.quantity,
          {
            serial_numbers: item.serial_numbers,
            lot_code: item.lot_code,
            expiration_date: item.expiration_date,
          },
        );
      }
    }

    return this.purchaseReceiptRepository.cancelReceipt(id, userId, reason);
  }

  async remove(id: string, _userId: string) {
    const receipt = await this.findOne(id);
    if (receipt.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only Draft receipts can be deleted');
    }
    return this.purchaseReceiptRepository.softDelete(id);
  }
}
