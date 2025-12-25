import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductTrackingType } from '../../common/enums/erp.enum';

export type ProductDocument = HydratedDocument<Product>;

class VariantAttribute {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ required: true })
  unit_of_measure: string;

  @Prop({ required: true, enum: ProductTrackingType, type: String })
  tracking_type: ProductTrackingType;

  @Prop({ type: Boolean, default: false })
  is_variant_parent: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Product', default: null, index: true })
  parent_product_id?: Types.ObjectId;

  @Prop({ type: [VariantAttribute], default: [] })
  variant_attributes?: VariantAttribute[];

  @Prop()
  barcode?: string;

  @Prop({ default: 0 })
  min_stock_level: number;

  @Prop({ default: 0 })
  sale_price_default: number;

  @Prop({ default: 0 })
  purchase_price_default: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  created_by?: string;

  @Prop()
  updated_by?: string;

  @Prop()
  deleted_by?: string;

  @Prop()
  created_at?: Date;

  @Prop()
  updated_at?: Date;

  @Prop()
  deleted_at?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', sku: 'text', parent_product_id: 'text' });
