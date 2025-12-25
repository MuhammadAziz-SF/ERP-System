import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class ListInventoryDto {
  @ApiProperty({ required: false, description: 'Filter by Warehouse ID' })
  @IsMongoId()
  @IsOptional()
  warehouse_id?: string;

  @ApiProperty({ required: false, description: 'Filter by Product ID' })
  @IsMongoId()
  @IsOptional()
  product_id?: string;
}
