import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const mockDashboardService = {
      getSalesSummary: jest.fn(),
      getDailySales: jest.fn(),
      getTopProducts: jest.fn(),
      getInventorySummary: jest.fn(),
      getPurchaseSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSalesSummary', () => {
    it('should call service method with query params', async () => {
      const query = { startDate: '2025-01-01', endDate: '2025-12-31' };
      const mockResult = {
        totalAmount: 100000,
        totalCount: 5,
        averageAmount: 20000,
        period: query,
      };

      jest.spyOn(service, 'getSalesSummary').mockResolvedValue(mockResult);

      const result = await controller.getSalesSummary(query);

      expect(service.getSalesSummary).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDailySales', () => {
    it('should call service method with query params', async () => {
      const query = { startDate: '2025-01-01', endDate: '2025-12-31' };
      const mockResult = [{ date: '2025-01-15', amount: 50000, count: 3 }];

      jest.spyOn(service, 'getDailySales').mockResolvedValue(mockResult);

      const result = await controller.getDailySales(query);

      expect(service.getDailySales).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTopProducts', () => {
    it('should call service method with query params', async () => {
      const query = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        limit: 10,
      };
      const mockResult = [
        {
          productId: 'prod1',
          productName: 'Product A',
          productSku: 'SKU-A',
          totalQuantity: 100,
          totalRevenue: 50000,
        },
      ];

      jest.spyOn(service, 'getTopProducts').mockResolvedValue(mockResult);

      const result = await controller.getTopProducts(query);

      expect(service.getTopProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getInventorySummary', () => {
    it('should call service method with query params', async () => {
      const query = { product_id: 'prod1' };
      const mockResult = {
        totalProducts: 10,
        totalQuantity: 500,
        byWarehouse: [],
        lowStock: [],
      };

      jest.spyOn(service, 'getInventorySummary').mockResolvedValue(mockResult);

      const result = await controller.getInventorySummary(query);

      expect(service.getInventorySummary).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPurchaseSummary', () => {
    it('should call service method with query params', async () => {
      const query = { startDate: '2025-01-01', endDate: '2025-12-31' };
      const mockResult = {
        totalAmount: 200000,
        totalCount: 10,
        averageAmount: 20000,
        period: query,
      };

      jest.spyOn(service, 'getPurchaseSummary').mockResolvedValue(mockResult);

      const result = await controller.getPurchaseSummary(query);

      expect(service.getPurchaseSummary).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });
});
