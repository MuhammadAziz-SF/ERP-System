import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductTrackingType } from '../../../common/enums/erp.enum';
import { ApiProperty } from '@nestjs/swagger';

export class VariantAttributeDto {
  @ApiProperty({ example: 'Color', description: 'Attribute name' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'Red', description: 'Attribute value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'WM-001',
    description: 'Stock Keeping Unit (Unique)',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'pcs', description: 'Unit of Measure' })
  @IsString()
  @IsNotEmpty()
  unit_of_measure: string;

  @ApiProperty({
    enum: ProductTrackingType,
    example: ProductTrackingType.SIMPLE,
    description: 'Tracking Type',
  })
  @IsEnum(ProductTrackingType)
  @IsNotEmpty()
  tracking_type: ProductTrackingType;

  @ApiProperty({
    example: false,
    description: 'Is this a parent product for variants?',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_variant_parent?: boolean;

  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'Parent Product ID (if variance)',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  parent_product_id?: string;

  @ApiProperty({
    type: [VariantAttributeDto],
    description: 'Attributes if specific variant',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  @IsOptional()
  variant_attributes?: VariantAttributeDto[];

  @ApiProperty({
    example: '1234567890123',
    description: 'Barcode',
    required: false,
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({
    example: 10,
    description: 'Minimum stock level warning',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_stock_level?: number;

  @ApiProperty({
    example: 25000,
    description: 'Default sale price',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sale_price_default?: number;

  @ApiProperty({
    example: 15000,
    description: 'Default purchase price',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchase_price_default?: number;

  @ApiProperty({ example: true, description: 'Is active?', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
