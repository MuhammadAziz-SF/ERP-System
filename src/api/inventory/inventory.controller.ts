import { Controller, Get, Query, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ListInventoryDto } from './dto/list-inventory.dto';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Check stock availability' })
  @ApiQuery({ name: 'productId', required: true })
  @ApiQuery({ name: 'warehouseId', required: true })
  async checkAvailability(
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId: string,
  ) {
    const quantity = await this.inventoryService.checkAvailability(
      productId,
      warehouseId,
    );
    return { productId, warehouseId, quantity };
  }

  @Get()
  @ApiOperation({ summary: 'List inventory with filters' })
  @ApiResponse({ status: 200, description: 'List of inventory items' })
  findAll(@Query() query: ListInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by Product ID' })
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get inventory by Warehouse ID' })
  findByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.inventoryService.findByWarehouse(warehouseId);
  }
}
