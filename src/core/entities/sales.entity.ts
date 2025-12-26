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

  @Prop({ type: [String] })
  serial_numbers?: string[];

  @Prop()
  lot_code?: string;
}

@Schema({ timestamps: true, collection: 'sales' })
export class Sale {
  @Prop({
    required: true,
    default: DocumentStatus.DRAFT,
    enum: DocumentStatus,
    type: String,
  })
  status: DocumentStatus;

  @Prop({ required: true })
  sale_date: Date;

  @Prop()
  customer_id?: string;

  @Prop({ required: true })
  warehouse_id: string;

  @Prop({ required: true })
  currency: string;

  @Prop()
  payment_type?: string;

  @Prop()
  comment?: string;

  @Prop({ type: [SaleItem], default: [] })
  items: SaleItem[];

  @Prop({ default: 0 })
  total_amount: number;

  @Prop({ default: 0 })
  total_quantity: number;

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
