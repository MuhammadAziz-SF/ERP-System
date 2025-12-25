import { Module } from '@nestjs/common';
import { PurchaseReceiptsService } from './purchase-receipts.service';
import { PurchaseReceiptsController } from './purchase-receipts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseReceiptSchema } from '../../core/entities/purchase-receipt.entity';
import { PurchaseReceiptRepository } from '../../core/repository/purchase-receipt.repository';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PurchaseReceipt', schema: PurchaseReceiptSchema },
    ]),
    InventoryModule,
  ],
  controllers: [PurchaseReceiptsController],
  providers: [PurchaseReceiptsService, PurchaseReceiptRepository],
})
export class PurchaseReceiptsModule {}
