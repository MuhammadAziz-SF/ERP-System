import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DocumentStatus } from '../../common/enums/erp.enum';

export type SaleDocument = HydratedDocument<Sale>;

@Schema()
class SaleItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unit_price: number;

  @Prop({ min: 0 })
  total_line_price: number;
  // --- Tracking Info (Qaysi biri sotilayotgani) ---
  @Prop({ type: [String] })
  serial_numbers?: string[]; // Aniq qaysi seriallar ketdi

  @Prop()
  lot_code?: string; // Qaysi partiyadan (FIFO uchun kerak)
}

@Schema({ timestamps: true, collection: 'sales' })
export class Sale {
  // --- Header ---
  @Prop({ required: true, default: DocumentStatus.DRAFT, enum: DocumentStatus })
  status: DocumentStatus;

  @Prop({ required: true })
  sale_date: Date;

  @Prop()
  customer_id?: string; // Mijoz (ixtiyoriy, masalan POS uchun)

  @Prop({ required: true })
  warehouse_id: string; // Qaysi ombordan chiqib ketyapti

  @Prop({ required: true })
  currency: string;

  @Prop()
  payment_type?: string; // Cash, Card, Transfer

  @Prop()
  comment?: string;

  // --- Items ---
  @Prop({ type: [SaleItem], default: [] })
  items: SaleItem[];

  // --- Totals ---
  @Prop({ default: 0 })
  total_amount: number;

  @Prop({ default: 0 })
  total_quantity: number;

  // --- Audit ---
  @Prop()
  created_by: string;

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

export const SaleSchema = SchemaFactory.createForClass(Sale);
