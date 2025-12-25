import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DocumentStatus } from '../../common/enums/erp.enum';

export type PurchaseReceiptDocument = HydratedDocument<PurchaseReceipt>;

@Schema()
class PurchaseItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unit_price: number;

  @Prop({ min: 0 })
  total_line_cost: number;

  @Prop({ type: [String] })
  serial_numbers?: string[];

  @Prop()
  lot_code?: string;

  @Prop()
  expiration_date?: Date;
}

@Schema({ timestamps: true, collection: 'purchase_receipts' })
export class PurchaseReceipt {
  @Prop({ required: true, default: DocumentStatus.DRAFT, enum: DocumentStatus })
  status: DocumentStatus;

  @Prop({ required: true })
  receipt_date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Partner', required: true })
  supplier_id: Types.ObjectId; // Oldin string edi, endi Partnerga bog'landi

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
  warehouse_id: Types.ObjectId; // Oldin string edi, endi Warehousega bog'landi

  @Prop({ required: true })
  currency: string;

  @Prop()
  invoice_number?: string;

  @Prop()
  comment?: string;

  @Prop({ type: [PurchaseItem], default: [] })
  items: PurchaseItem[];

  @Prop({ default: 0 })
  total_amount: number;

  @Prop({ default: 0 })
  total_quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId;

  @Prop()
  confirmed_by?: string;

  @Prop()
  confirmed_at?: Date;

  @Prop()
  cancelled_by?: string;

  @Prop()
  cancelled_at?: Date;

  @Prop()
  cancellation_reason?: string;
}

export const PurchaseReceiptSchema =
  SchemaFactory.createForClass(PurchaseReceipt);
