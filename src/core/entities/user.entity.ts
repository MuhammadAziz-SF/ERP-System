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
  role: string;

  @Prop({ select: false })
  password?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
