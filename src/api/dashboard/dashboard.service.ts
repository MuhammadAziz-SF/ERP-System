import { Injectable } from '@nestjs/common';
import { SalesRepository } from '../../core/repository/sales.repository';
import { PurchaseReceiptRepository } from '../../core/repository/purchase-receipt.repository';
import { InventoryRepository } from '../../core/repository/inventory.repository';
import { ProductRepository } from '../../core/repository/product.repository';
import { DocumentStatus } from '../../common/enums/erp.enum';
import {
  DashboardQueryDto,
  TopProductsQueryDto,
  InventorySummaryQueryDto,
} from './dto/dashboard-query.dto';
import {
  SalesSummaryResponse,
  DailySalesResponse,
  TopProductResponse,
  InventorySummaryResponse,
  PurchaseSummaryResponse,
} from './interfaces/dashboard-responses.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Sale } from '../../core/entities/sales.entity';
import { PurchaseReceipt } from '../../core/entities/purchase-receipt.entity';
import { Model, Types, PipelineStage } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly purchaseReceiptRepository: PurchaseReceiptRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(PurchaseReceipt.name)
    private readonly purchaseReceiptModel: Model<PurchaseReceipt>,
  ) {}

  async getSalesSummary(
    query: DashboardQueryDto,
  ): Promise<SalesSummaryResponse> {
    const { startDate, endDate } = this.getDateRange(query);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: DocumentStatus.CONFIRMED,
          sale_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total_amount' },
          totalCount: { $sum: 1 },
        },
      },
    ];

    const result = await this.saleModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        period: { startDate, endDate },
      };
    }

    const { totalAmount, totalCount } = result[0];
    return {
      totalAmount: totalAmount || 0,
      totalCount: totalCount || 0,
      averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
      period: { startDate, endDate },
    };
  }

  async getDailySales(query: DashboardQueryDto): Promise<DailySalesResponse[]> {
    const { startDate, endDate } = this.getDateRange(query);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: DocumentStatus.CONFIRMED,
          sale_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$sale_date' },
          },
          amount: { $sum: '$total_amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          amount: 1,
          count: 1,
        },
      },
    ];

    return await this.saleModel.aggregate(pipeline);
  }

  async getTopProducts(
    query: TopProductsQueryDto,
  ): Promise<TopProductResponse[]> {
    const { startDate, endDate } = this.getDateRange(query);
    const limit = query.limit || 10;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: DocumentStatus.CONFIRMED,
          sale_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.product_id',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total_line_price' },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          productName: { $ifNull: ['$product.name', 'Unknown Product'] },
          productSku: { $ifNull: ['$product.sku', 'N/A'] },
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ];

    return await this.saleModel.aggregate(pipeline);
  }

  async getInventorySummary(
    query: InventorySummaryQueryDto,
  ): Promise<InventorySummaryResponse> {
    const filter: any = {};
    if (query.product_id) {
      filter.product_id = new Types.ObjectId(query.product_id);
    }
    if (query.warehouse_id) {
      filter.warehouse_id = new Types.ObjectId(query.warehouse_id);
    }

    const inventory = await this.inventoryRepository.findAll(filter);

    const productIds = new Set(
      inventory.map((inv) => inv.product_id.toString()),
    );
    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

    const warehouseMap = new Map<
      string,
      { quantity: number; products: Set<string> }
    >();
    inventory.forEach((inv) => {
      const whId = inv.warehouse_id.toString();
      if (!warehouseMap.has(whId)) {
        warehouseMap.set(whId, { quantity: 0, products: new Set() });
      }
      const wh = warehouseMap.get(whId)!;
      wh.quantity += inv.quantity;
      wh.products.add(inv.product_id.toString());
    });

    const byWarehouse = Array.from(warehouseMap.entries()).map(
      ([warehouseId, data]) => ({
        warehouseId,
        warehouseName: 'Warehouse',
        quantity: data.quantity,
        productCount: data.products.size,
      }),
    );

    const lowStockMap = new Map<string, number>();
    inventory.forEach((inv) => {
      const productId = inv.product_id.toString();
      const current = lowStockMap.get(productId) || 0;
      lowStockMap.set(productId, current + inv.quantity);
    });

    const lowStockProductIds = Array.from(lowStockMap.entries())
      .filter(([_, qty]) => qty < 10)
      .map(([id]) => id);

    const lowStock = await Promise.all(
      lowStockProductIds.slice(0, 10).map(async (productId) => {
        const product = await this.productRepository.findById(productId);
        return {
          productId,
          productName: product?.name || 'Unknown Product',
          currentStock: lowStockMap.get(productId) || 0,
        };
      }),
    );

    return {
      totalProducts: productIds.size,
      totalQuantity,
      byWarehouse,
      lowStock,
    };
  }

  async getPurchaseSummary(
    query: DashboardQueryDto,
  ): Promise<PurchaseSummaryResponse> {
    const { startDate, endDate } = this.getDateRange(query);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: DocumentStatus.CONFIRMED,
          receipt_date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total_amount' },
          totalCount: { $sum: 1 },
        },
      },
    ];

    const result = await this.purchaseReceiptModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        period: { startDate, endDate },
      };
    }

    const { totalAmount, totalCount } = result[0];
    return {
      totalAmount: totalAmount || 0,
      totalCount: totalCount || 0,
      averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
      period: { startDate, endDate },
    };
  }

  private getDateRange(query: DashboardQueryDto): {
    startDate: string;
    endDate: string;
  } {
    const endDate = query.endDate || new Date().toISOString().split('T')[0];
    const startDate =
      query.startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    return { startDate, endDate };
  }
}
