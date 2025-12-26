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
import { PurchaseReceiptsService } from './purchase-receipts.service';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { UpdatePurchaseReceiptDto } from './dto/update-purchase-receipt.dto';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';

@ApiTags('Purchase Receipts')
@Controller('purchase-receipts')
export class PurchaseReceiptsController {
  constructor(
    private readonly purchaseReceiptsService: PurchaseReceiptsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase receipt (Draft)' })
  @ApiHeader({ name: 'x-user-id', required: false })
  create(
    @Body() createPurchaseReceiptDto: CreatePurchaseReceiptDto,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.purchaseReceiptsService.create(
      createPurchaseReceiptDto,
      userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all purchase receipts' })
  findAll() {
    return this.purchaseReceiptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a receipt by ID' })
  findOne(@Param('id') id: string) {
    return this.purchaseReceiptsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft receipt' })
  @ApiHeader({ name: 'x-user-id', required: false })
  update(
    @Param('id') id: string,
    @Body() updatePurchaseReceiptDto: UpdatePurchaseReceiptDto,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.purchaseReceiptsService.update(
      id,
      updatePurchaseReceiptDto,
      userId,
    );
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm receipt and update inventory' })
  @ApiHeader({ name: 'x-user-id', required: false })
  confirm(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.purchaseReceiptsService.confirm(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel receipt and revert inventory' })
  @ApiHeader({ name: 'x-user-id', required: false })
  @ApiBody({
    schema: { type: 'object', properties: { reason: { type: 'string' } } },
  })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.purchaseReceiptsService.cancel(id, userId, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) a draft receipt' })
  @ApiHeader({ name: 'x-user-id', required: false })
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'system',
  ) {
    return this.purchaseReceiptsService.remove(id, userId);
  }
}
