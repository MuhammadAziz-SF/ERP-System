import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DashboardQueryDto,
  TopProductsQueryDto,
  InventorySummaryQueryDto,
} from './dto/dashboard-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('sales/summary')
  @ApiOperation({
    summary: 'Get sales summary',
    description:
      'Returns total sales amount, count, and average for CONFIRMED sales only',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales summary retrieved successfully',
  })
  getSalesSummary(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getSalesSummary(query);
  }

  @Get('sales/daily')
  @ApiOperation({
    summary: 'Get daily sales',
    description: 'Returns sales grouped by date for CONFIRMED sales only',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily sales retrieved successfully',
  })
  getDailySales(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getDailySales(query);
  }

  @Get('products/top')
  @ApiOperation({
    summary: 'Get top products',
    description: 'Returns most sold products by quantity from CONFIRMED sales',
  })
  @ApiResponse({
    status: 200,
    description: 'Top products retrieved successfully',
  })
  getTopProducts(@Query() query: TopProductsQueryDto) {
    return this.dashboardService.getTopProducts(query);
  }

  @Get('inventory/summary')
  @ApiOperation({
    summary: 'Get inventory summary',
    description: 'Returns current stock levels and warehouse breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory summary retrieved successfully',
  })
  getInventorySummary(@Query() query: InventorySummaryQueryDto) {
    return this.dashboardService.getInventorySummary(query);
  }

  @Get('purchases/summary')
  @ApiOperation({
    summary: 'Get purchase summary',
    description:
      'Returns total purchases amount, count, and average for CONFIRMED receipts only',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase summary retrieved successfully',
  })
  getPurchaseSummary(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getPurchaseSummary(query);
  }
}
