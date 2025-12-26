import { DashboardService } from './dashboard.service';
import { DocumentStatus } from '../../common/enums/erp.enum';
import { Types } from 'mongoose';

jest.mock('../../core/repository/sales.repository');
jest.mock('../../core/repository/purchase-receipt.repository');
jest.mock('../../core/repository/inventory.repository');
jest.mock('../../core/repository/product.repository');

describe('DashboardService', () => {
  let service: DashboardService;
  let salesRepository: any;
  let purchaseReceiptRepository: any;
  let inventoryRepository: any;
  let productRepository: any;
  let saleModel: any;
  let purchaseReceiptModel: any;

  beforeEach(() => {
    salesRepository = {
      findAll: jest.fn(),
    };

    purchaseReceiptRepository = {
      findAll: jest.fn(),
    };

    inventoryRepository = {
      findAll: jest.fn(),
    };

    productRepository = {
      findById: jest.fn(),
    };

    saleModel = {
      aggregate: jest.fn(),
    };

    purchaseReceiptModel = {
      aggregate: jest.fn(),
    };

    service = new DashboardService(
      salesRepository,
      purchaseReceiptRepository,
      inventoryRepository,
      productRepository,
      saleModel,
      purchaseReceiptModel,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesSummary', () => {
    it('should return sales summary for CONFIRMED sales only', async () => {
      const mockResult = [
        {
          _id: null,
          totalAmount: 100000,
          totalCount: 5,
        },
      ];

      saleModel.aggregate.mockResolvedValue(mockResult);

      const result = await service.getSalesSummary({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result.totalAmount).toBe(100000);
      expect(result.totalCount).toBe(5);
      expect(result.averageAmount).toBe(20000);

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });

    it('should return zero values when no sales exist', async () => {
      saleModel.aggregate.mockResolvedValue([]);

      const result = await service.getSalesSummary({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result.totalAmount).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.averageAmount).toBe(0);
    });

    it('should use default date range when not specified', async () => {
      saleModel.aggregate.mockResolvedValue([]);

      await service.getSalesSummary({});

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.sale_date).toBeDefined();
      expect(pipeline[0].$match.sale_date.$gte).toBeInstanceOf(Date);
      expect(pipeline[0].$match.sale_date.$lte).toBeInstanceOf(Date);
    });
  });

  describe('getDailySales', () => {
    it('should group CONFIRMED sales by date', async () => {
      const mockResult = [
        { date: '2025-01-15', amount: 50000, count: 3 },
        { date: '2025-01-16', amount: 30000, count: 2 },
      ];

      saleModel.aggregate.mockResolvedValue(mockResult);

      const result = await service.getDailySales({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-01-15');
      expect(result[0].amount).toBe(50000);

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });
  });

  describe('getTopProducts', () => {
    it('should return top products from CONFIRMED sales', async () => {
      const mockResult = [
        {
          productId: 'prod1',
          productName: 'Product A',
          productSku: 'SKU-A',
          totalQuantity: 100,
          totalRevenue: 50000,
        },
        {
          productId: 'prod2',
          productName: 'Product B',
          productSku: 'SKU-B',
          totalQuantity: 80,
          totalRevenue: 40000,
        },
      ];

      saleModel.aggregate.mockResolvedValue(mockResult);

      const result = await service.getTopProducts({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        limit: 10,
      });

      expect(result).toHaveLength(2);
      expect(result[0].productName).toBe('Product A');
      expect(result[0].totalQuantity).toBe(100);

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });

    it('should respect limit parameter', async () => {
      saleModel.aggregate.mockResolvedValue([]);

      await service.getTopProducts({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        limit: 5,
      });

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      const limitStage = pipeline.find(
        (stage: any) => stage.$limit !== undefined,
      );
      expect(limitStage.$limit).toBe(5);
    });

    it('should use default limit of 10 when not specified', async () => {
      saleModel.aggregate.mockResolvedValue([]);

      await service.getTopProducts({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      const limitStage = pipeline.find(
        (stage: any) => stage.$limit !== undefined,
      );
      expect(limitStage.$limit).toBe(10);
    });
  });

  describe('getInventorySummary', () => {
    it('should return inventory summary without status filtering', async () => {
      const mockInventory = [
        {
          product_id: new Types.ObjectId('507f1f77bcf86cd799439011'),
          warehouse_id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          quantity: 50,
        },
        {
          product_id: new Types.ObjectId('507f1f77bcf86cd799439013'),
          warehouse_id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          quantity: 30,
        },
      ];

      inventoryRepository.findAll.mockResolvedValue(mockInventory);

      const result = await service.getInventorySummary({});

      expect(result.totalProducts).toBe(2);
      expect(result.totalQuantity).toBe(80);
      expect(result.byWarehouse).toBeDefined();
    });

    it('should filter by product_id when specified', async () => {
      const productId = new Types.ObjectId().toHexString();
      inventoryRepository.findAll.mockResolvedValue([]);

      await service.getInventorySummary({ product_id: productId });

      expect(inventoryRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: expect.any(Types.ObjectId),
        }),
      );
    });

    it('should filter by warehouse_id when specified', async () => {
      const warehouseId = new Types.ObjectId().toHexString();
      inventoryRepository.findAll.mockResolvedValue([]);

      await service.getInventorySummary({ warehouse_id: warehouseId });

      expect(inventoryRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          warehouse_id: expect.any(Types.ObjectId),
        }),
      );
    });
  });

  describe('getPurchaseSummary', () => {
    it('should return purchase summary for CONFIRMED receipts only', async () => {
      const mockResult = [
        {
          _id: null,
          totalAmount: 200000,
          totalCount: 10,
        },
      ];

      purchaseReceiptModel.aggregate.mockResolvedValue(mockResult);

      const result = await service.getPurchaseSummary({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result.totalAmount).toBe(200000);
      expect(result.totalCount).toBe(10);
      expect(result.averageAmount).toBe(20000);

      const pipeline = purchaseReceiptModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });

    it('should exclude DRAFT and CANCELLED receipts', async () => {
      purchaseReceiptModel.aggregate.mockResolvedValue([]);

      await service.getPurchaseSummary({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      const pipeline = purchaseReceiptModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
      expect(pipeline[0].$match.status).not.toBe(DocumentStatus.DRAFT);
      expect(pipeline[0].$match.status).not.toBe(DocumentStatus.CANCELLED);
    });
  });

  describe('ERP Principles Validation', () => {
    it('should only aggregate CONFIRMED sales (not DRAFT)', async () => {
      saleModel.aggregate.mockResolvedValue([]);

      await service.getSalesSummary({});

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });

    it('should only aggregate CONFIRMED sales (not CANCELLED)', async () => {
      saleModel.aggregate.mockResolvedValue([]);

      await service.getDailySales({});

      const pipeline = saleModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });

    it('should only aggregate CONFIRMED purchases (not DRAFT)', async () => {
      purchaseReceiptModel.aggregate.mockResolvedValue([]);

      await service.getPurchaseSummary({});

      const pipeline = purchaseReceiptModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match.status).toBe(DocumentStatus.CONFIRMED);
    });

    it('should have no status filter for inventory (no business logic)', async () => {
      inventoryRepository.findAll.mockResolvedValue([]);

      await service.getInventorySummary({});

      const args = inventoryRepository.findAll.mock.calls[0][0];
      expect(args.status).toBeUndefined();
    });
  });
});
