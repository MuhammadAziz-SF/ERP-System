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

export class TrackingInfoDto {
  @ApiProperty({
    description: 'Serial numbers if serialized product',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serial_numbers?: string[];

  @ApiProperty({
    description: 'Lot code if lot-tracked product',
    required: false,
  })
  @IsString()
  @IsOptional()
  lot_code?: string;

  @ApiProperty({
    description: 'Expiration date if expirable product',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiration_date?: Date;
}

export class AdjustStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsMongoId()
  @IsNotEmpty()
  warehouse_id: string;

  @ApiProperty({ description: 'Quantity to adjust' })
  @IsNumber()
  @Min(0) // Adjustment quantity is usually positive, the operation (increase/decrease) determines sign
  quantity: number;

  @ApiProperty({
    description: 'Tracking info for the adjustment',
    required: false,
    type: TrackingInfoDto,
  })
  @ValidateNested()
  @Type(() => TrackingInfoDto)
  @IsOptional()
  tracking_info?: TrackingInfoDto;
}
