import {
  IsOptional,
  IsDateString,
  IsMongoId,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiProperty({
    description: 'Start date for filtering (ISO 8601)',
    required: false,
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO 8601)',
    required: false,
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TopProductsQueryDto extends DashboardQueryDto {
  @ApiProperty({
    description: 'Number of top products to return',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class InventorySummaryQueryDto {
  @ApiProperty({
    description: 'Filter by specific product ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  product_id?: string;

  @ApiProperty({
    description: 'Filter by specific warehouse ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  warehouse_id?: string;
}
