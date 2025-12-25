import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRoles } from '../../../common/enums/erp.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'jdoe',
    description: 'The unique username of the user',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    enum: UserRoles,
    example: UserRoles.CUSTOMER,
    description: 'Role of the user',
    required: false,
  })
  @IsEnum(UserRoles)
  @IsOptional()
  role?: UserRoles;

  @ApiProperty({
    example: 'password123',
    description: 'Password hash (inputs as plain text, hashed by service)',
  })
  @IsString()
  @IsNotEmpty()
  password_hash: string;
}
