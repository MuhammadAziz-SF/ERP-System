import { SalesService } from './sales.service';
import { DocumentStatus } from '../../common/enums/erp.enum';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

jest.mock('../../core/repository/sales.repository');
jest.mock('../inventory/inventory.service');

describe('SalesService', () => {
  let service: SalesService;
  let salesRepository: any;
  let inventoryService: any;

  const mockUserId = new Types.ObjectId().toHexString();
  const mockWarehouseId = new Types.ObjectId().toHexString();
  const mockProductId = new Types.ObjectId().toHexString();

  beforeEach(() => {
    salesRepository = {
      findById: jest.fn(),
      createWithAudit: jest.fn(),
      updateWithAudit: jest.fn(),
      confirmSale: jest.fn(),
      cancelSale: jest.fn(),
      softDelete: jest.fn(),
      findAll: jest.fn(),
    };

    inventoryService = {
      increaseStock: jest.fn(),
      decreaseStock: jest.fn(),
    };

    service = new SalesService(salesRepository, inventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirm - Sales Confirmation → Stock Decrease', () => {
    it('should confirm sale and decrease stock for SIMPLE tracking', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 50,
            unit_price: 8000,
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.confirmSale.mockResolvedValue({
        ...mockSale,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockSale._id, mockUserId);

      expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        50,
        {
          serial_numbers: undefined,
          lot_code: undefined,
        },
      );
      expect(salesRepository.confirmSale).toHaveBeenCalledWith(
        mockSale._id,
        mockUserId,
      );
    });

    it('should confirm sale and decrease stock for SERIALIZED tracking', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 2,
            unit_price: 15000,
            serial_numbers: ['SN101', 'SN102'],
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.confirmSale.mockResolvedValue({
        ...mockSale,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockSale._id, mockUserId);

      expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        2,
        {
          serial_numbers: ['SN101', 'SN102'],
          lot_code: undefined,
        },
      );
    });

    it('should confirm sale and decrease stock for LOT_TRACKED tracking', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 300,
            unit_price: 4000,
            lot_code: 'LOT2025-ABC',
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.confirmSale.mockResolvedValue({
        ...mockSale,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockSale._id, mockUserId);

      expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        300,
        {
          serial_numbers: undefined,
          lot_code: 'LOT2025-ABC',
        },
      );
    });

    it('should throw error when confirming non-draft sale', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        warehouse_id: mockWarehouseId,
        items: [],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        'Only Draft sales can be confirmed',
      );
    });
  });

  describe('confirm - Sales Blocking Rules', () => {
    it('should block sale when insufficient stock available', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 1000,
            unit_price: 5000,
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      inventoryService.decreaseStock.mockRejectedValue(
        new BadRequestException('Insufficient stock'),
      );

      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        'Insufficient stock',
      );

      expect(salesRepository.confirmSale).not.toHaveBeenCalled();
    });

    it('should block sale when serial number not found in warehouse', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 1,
            unit_price: 12000,
            serial_numbers: ['SN999'],
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      inventoryService.decreaseStock.mockRejectedValue(
        new BadRequestException('Serial number SN999 not found in warehouse'),
      );

      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        'Serial number SN999 not found in warehouse',
      );

      expect(salesRepository.confirmSale).not.toHaveBeenCalled();
    });

    it('should block sale when lot code not available', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 100,
            unit_price: 3000,
            lot_code: 'LOT-INVALID',
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      inventoryService.decreaseStock.mockRejectedValue(
        new BadRequestException('Lot code LOT-INVALID not found'),
      );

      await expect(service.confirm(mockSale._id, mockUserId)).rejects.toThrow(
        BadRequestException,
      );

      expect(salesRepository.confirmSale).not.toHaveBeenCalled();
    });
  });

  describe('cancel - Sales Cancellation → Stock Restoration', () => {
    it('should cancel confirmed sale and increase stock (restore)', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 50,
            unit_price: 8000,
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.cancelSale.mockResolvedValue({
        ...mockSale,
        status: DocumentStatus.CANCELLED,
      });

      await service.cancel(mockSale._id, mockUserId, 'Customer returned items');

      expect(inventoryService.increaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        50,
        {
          serial_numbers: undefined,
          lot_code: undefined,
        },
      );
      expect(salesRepository.cancelSale).toHaveBeenCalledWith(
        mockSale._id,
        mockUserId,
        'Customer returned items',
      );
    });

    it('should cancel confirmed sale with serialized items and restore stock', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 2,
            unit_price: 15000,
            serial_numbers: ['SN201', 'SN202'],
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.cancelSale.mockResolvedValue({
        ...mockSale,
        status: DocumentStatus.CANCELLED,
      });

      await service.cancel(
        mockSale._id,
        mockUserId,
        'Defective items returned',
      );

      expect(inventoryService.increaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        2,
        {
          serial_numbers: ['SN201', 'SN202'],
          lot_code: undefined,
        },
      );
    });

    it('should cancel draft sale without changing inventory', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: mockWarehouseId,
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 25,
            unit_price: 6000,
          },
        ],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.cancelSale.mockResolvedValue({
        ...mockSale,
        status: DocumentStatus.CANCELLED,
      });

      await service.cancel(
        mockSale._id,
        mockUserId,
        'Customer cancelled order',
      );

      expect(inventoryService.increaseStock).not.toHaveBeenCalled();
      expect(salesRepository.cancelSale).toHaveBeenCalledWith(
        mockSale._id,
        mockUserId,
        'Customer cancelled order',
      );
    });

    it('should throw error when canceling already cancelled sale', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CANCELLED,
        warehouse_id: mockWarehouseId,
        items: [],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      await expect(
        service.cancel(mockSale._id, mockUserId, 'Test'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(mockSale._id, mockUserId, 'Test'),
      ).rejects.toThrow('Already cancelled');
    });
  });

  describe('update - Sales Update Rules', () => {
    it('should allow updating draft sales', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        items: [],
      };

      const updateDto = {
        comment: 'Updated sale comment',
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.updateWithAudit.mockResolvedValue({
        ...mockSale,
        ...updateDto,
      });

      await service.update(mockSale._id, updateDto, mockUserId);

      expect(salesRepository.updateWithAudit).toHaveBeenCalled();
    });

    it('should throw error when updating non-draft sale', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        items: [],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      await expect(
        service.update(mockSale._id, {}, mockUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockSale._id, {}, mockUserId),
      ).rejects.toThrow('Only Draft sales can be updated');
    });
  });

  describe('remove - Sales Deletion Rules', () => {
    it('should allow deleting draft sales', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        items: [],
      };

      salesRepository.findById.mockResolvedValue(mockSale);
      salesRepository.softDelete.mockResolvedValue({});

      await service.remove(mockSale._id, mockUserId);

      expect(salesRepository.softDelete).toHaveBeenCalledWith(mockSale._id);
    });

    it('should throw error when deleting non-draft sale', async () => {
      const mockSale = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        items: [],
      };

      salesRepository.findById.mockResolvedValue(mockSale);

      await expect(service.remove(mockSale._id, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(mockSale._id, mockUserId)).rejects.toThrow(
        'Only Draft sales can be deleted',
      );
    });
  });
});
