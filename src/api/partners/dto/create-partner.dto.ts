import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartnerType } from '../../../core/entities/partner.entity';

export class CreatePartnerDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Name of the partner (Customer/Supplier)',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: PartnerType,
    example: PartnerType.CUSTOMER,
    description: 'Type of partner',
  })
  @IsEnum(PartnerType)
  @IsNotEmpty()
  type: PartnerType;

  @ApiProperty({
    example: '+998901234567',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'info@acme.com',
    description: 'Email address',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Tashkent, Uzbekistan',
    description: 'Physical address',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
