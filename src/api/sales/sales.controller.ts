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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale (Draft)' })
  @ApiHeader({ name: 'x-user-id', required: false })
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.salesService.create(createSaleDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all sales' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a sale by ID' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft sale' })
  @ApiHeader({ name: 'x-user-id', required: false })
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.salesService.update(id, updateSaleDto, userId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm sale and decrease inventory' })
  @ApiHeader({ name: 'x-user-id', required: false })
  confirm(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.salesService.confirm(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel sale and revert inventory' })
  @ApiHeader({ name: 'x-user-id', required: false })
  @ApiBody({
    schema: { type: 'object', properties: { reason: { type: 'string' } } },
  })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.salesService.cancel(id, userId, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) a draft sale' })
  @ApiHeader({ name: 'x-user-id', required: false })
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.salesService.remove(id, userId);
  }
}
