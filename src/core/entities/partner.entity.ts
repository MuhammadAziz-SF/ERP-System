import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum PartnerType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  BOTH = 'BOTH',
}

export type PartnerDocument = HydratedDocument<Partner>;

@Schema({ timestamps: true })
export class Partner {
  @Prop({ required: true })
  name: string; // Kompaniya nomi yoki shaxs ismi

  @Prop({ required: true, enum: PartnerType })
  type: PartnerType;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  address?: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  deleted_at?: Date;
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);
