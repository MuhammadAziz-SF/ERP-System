import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 100, description: 'Quantity purchased' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 12000, description: 'Unit cost price' })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({
    description: 'Serial numbers (if tracking type is serialized)',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serial_numbers?: string[];

  @ApiProperty({ description: 'Lot code (if lot tracked)', required: false })
  @IsString()
  @IsOptional()
  lot_code?: string;

  @ApiProperty({
    description: 'Expiration date (if expirable)',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiration_date?: Date;
}

export class CreatePurchaseReceiptDto {
  @ApiProperty({ description: 'Date of receipt' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  receipt_date: Date;

  @ApiProperty({ description: 'Supplier ID (Partner)' })
  @IsMongoId()
  @IsNotEmpty()
  supplier_id: string;

  @ApiProperty({ description: 'Warehouse ID (Destination)' })
  @IsMongoId()
  @IsNotEmpty()
  warehouse_id: string;

  @ApiProperty({ example: 'UZS', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 'INV-001',
    description: 'Invoice number provided by supplier',
    required: false,
  })
  @IsString()
  @IsOptional()
  invoice_number?: string;

  @ApiProperty({ description: 'Additional comments', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    type: [PurchaseItemDto],
    description: 'List of items received',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  @IsNotEmpty()
  items: PurchaseItemDto[];
}
