import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'User ID for audit',
  })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'User ID for audit',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) a product' })
  @ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'User ID for audit',
  })
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.productsService.remove(id, userId);
  }
}
