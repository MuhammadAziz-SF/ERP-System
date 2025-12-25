import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WarehouseDocument = HydratedDocument<Warehouse>;

@Schema({ timestamps: true })
export class Warehouse {
  @Prop({ required: true })
  name: string;

  @Prop()
  location?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  deleted_at?: Date;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
