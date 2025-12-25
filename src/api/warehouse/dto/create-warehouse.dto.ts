import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({
    example: 'Main Warehouse',
    description: 'Name of the warehouse',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Downtown District 1',
    description: 'Location details',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'Primary storage for electronics',
    description: 'Description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
