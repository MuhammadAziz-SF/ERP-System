import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  role: string; // 'admin', 'warehouse_manager', 'cashier'

  // Parol va auth logikasi bu topshiriqning asosiy qismi emas,
  // lekin login qilish uchun kerak bo'lsa qo'shasiz.
  @Prop({ select: false })
  password?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
