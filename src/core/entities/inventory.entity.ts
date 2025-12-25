import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true, collection: 'inventory' })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  product_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true, index: true })
  warehouse_id: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ index: true })
  serial_number?: string;

  @Prop({ index: true })
  lot_code?: string;

  @Prop()
  expiration_date?: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

InventorySchema.index(
  { product_id: 1, warehouse_id: 1, serial_number: 1 },
  {
    unique: true,
    partialFilterExpression: { serial_number: { $exists: true } },
  },
);
