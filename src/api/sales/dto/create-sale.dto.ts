import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 1, description: 'Quantity sold' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 25000, description: 'Unit selling price' })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({
    description: 'Serial numbers (if serialized)',
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
}

export class CreateSaleDto {
  @ApiProperty({ description: 'Date of sale' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  sale_date: Date;

  @ApiProperty({ description: 'Customer ID (Partner)', required: false })
  @IsMongoId()
  @IsOptional() // Customer is optional in entity
  customer_id?: string;

  @ApiProperty({ description: 'Warehouse ID (Source)' })
  @IsMongoId()
  @IsNotEmpty()
  warehouse_id: string;

  @ApiProperty({ example: 'UZS', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 'Cash',
    description: 'Payment type',
    required: false,
  })
  @IsString()
  @IsOptional()
  payment_type?: string;

  @ApiProperty({ description: 'Additional comments', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ type: [SaleItemDto], description: 'List of items sold' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @IsNotEmpty()
  items: SaleItemDto[];
}
