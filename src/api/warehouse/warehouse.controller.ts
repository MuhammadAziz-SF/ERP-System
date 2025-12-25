import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Warehouses')
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({
    status: 201,
    description: 'The warehouse has been successfully created.',
  })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all warehouses' })
  findAll() {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a warehouse by ID' })
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a warehouse' })
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) a warehouse' })
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }
}
