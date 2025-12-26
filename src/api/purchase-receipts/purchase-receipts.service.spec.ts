import { PurchaseReceiptsService } from './purchase-receipts.service';
import { DocumentStatus } from '../../common/enums/erp.enum';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

jest.mock('../../core/repository/purchase-receipt.repository');
jest.mock('../inventory/inventory.service');

describe('PurchaseReceiptsService', () => {
  let service: PurchaseReceiptsService;
  let purchaseReceiptRepository: any;
  let inventoryService: any;

  const mockUserId = new Types.ObjectId().toHexString();
  const mockWarehouseId = new Types.ObjectId().toHexString();
  const mockProductId = new Types.ObjectId().toHexString();

  beforeEach(() => {
    purchaseReceiptRepository = {
      findById: jest.fn(),
      createWithAudit: jest.fn(),
      updateWithAudit: jest.fn(),
      confirmReceipt: jest.fn(),
      cancelReceipt: jest.fn(),
      softDelete: jest.fn(),
      findAll: jest.fn(),
    };

    inventoryService = {
      increaseStock: jest.fn(),
      decreaseStock: jest.fn(),
    };

    service = new PurchaseReceiptsService(
      purchaseReceiptRepository,
      inventoryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirm - Purchase Receipt Confirmation → Stock Increase', () => {
    it('should confirm receipt and increase stock for SIMPLE tracking', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 100,
            unit_price: 5000,
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.confirmReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockReceipt._id, mockUserId);

      expect(inventoryService.increaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        100,
        {
          serial_numbers: undefined,
          lot_code: undefined,
          expiration_date: undefined,
        },
      );
      expect(purchaseReceiptRepository.confirmReceipt).toHaveBeenCalledWith(
        mockReceipt._id,
        mockUserId,
      );
    });

    it('should confirm receipt and increase stock for SERIALIZED tracking', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 2,
            unit_price: 10000,
            serial_numbers: ['SN001', 'SN002'],
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.confirmReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockReceipt._id, mockUserId);

      expect(inventoryService.increaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        2,
        {
          serial_numbers: ['SN001', 'SN002'],
          lot_code: undefined,
          expiration_date: undefined,
        },
      );
    });

    it('should confirm receipt and increase stock for LOT_TRACKED tracking', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 500,
            unit_price: 2000,
            lot_code: 'LOT2025-001',
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.confirmReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockReceipt._id, mockUserId);

      expect(inventoryService.increaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        500,
        {
          serial_numbers: undefined,
          lot_code: 'LOT2025-001',
          expiration_date: undefined,
        },
      );
    });

    it('should confirm receipt and increase stock for EXPIRABLE tracking', async () => {
      const expirationDate = new Date('2026-12-31');
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 200,
            unit_price: 3000,
            expiration_date: expirationDate,
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.confirmReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm(mockReceipt._id, mockUserId);

      expect(inventoryService.increaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        200,
        {
          serial_numbers: undefined,
          lot_code: undefined,
          expiration_date: expirationDate,
        },
      );
    });

    it('should throw error when confirming non-draft receipt', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);

      await expect(
        service.confirm(mockReceipt._id, mockUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirm(mockReceipt._id, mockUserId),
      ).rejects.toThrow('Only Draft receipts can be confirmed');
    });
  });

  describe('cancel - Purchase Receipt Cancellation → Stock Restoration', () => {
    it('should cancel confirmed receipt and decrease stock (restore)', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 100,
            unit_price: 5000,
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.cancelReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CANCELLED,
      });

      await service.cancel(
        mockReceipt._id,
        mockUserId,
        'Order cancelled by supplier',
      );

      expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        100,
        {
          serial_numbers: undefined,
          lot_code: undefined,
          expiration_date: undefined,
        },
      );
      expect(purchaseReceiptRepository.cancelReceipt).toHaveBeenCalledWith(
        mockReceipt._id,
        mockUserId,
        'Order cancelled by supplier',
      );
    });

    it('should cancel confirmed receipt with serialized items and decrease stock', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 2,
            unit_price: 10000,
            serial_numbers: ['SN001', 'SN002'],
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.cancelReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CANCELLED,
      });

      await service.cancel(
        mockReceipt._id,
        mockUserId,
        'Incorrect items received',
      );

      expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
        mockProductId,
        mockWarehouseId,
        2,
        {
          serial_numbers: ['SN001', 'SN002'],
          lot_code: undefined,
          expiration_date: undefined,
        },
      );
    });

    it('should cancel draft receipt without changing inventory', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [
          {
            product_id: new Types.ObjectId(mockProductId),
            quantity: 50,
            unit_price: 5000,
          },
        ],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.cancelReceipt.mockResolvedValue({
        ...mockReceipt,
        status: DocumentStatus.CANCELLED,
      });

      await service.cancel(mockReceipt._id, mockUserId, 'No longer needed');

      expect(inventoryService.decreaseStock).not.toHaveBeenCalled();
      expect(purchaseReceiptRepository.cancelReceipt).toHaveBeenCalledWith(
        mockReceipt._id,
        mockUserId,
        'No longer needed',
      );
    });

    it('should throw error when canceling already cancelled receipt', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CANCELLED,
        warehouse_id: new Types.ObjectId(mockWarehouseId),
        items: [],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);

      await expect(
        service.cancel(mockReceipt._id, mockUserId, 'Test'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(mockReceipt._id, mockUserId, 'Test'),
      ).rejects.toThrow('Already cancelled');
    });
  });

  describe('update - Purchase Receipt Update Rules', () => {
    it('should allow updating draft receipts', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        items: [],
      };

      const updateDto = {
        comment: 'Updated comment',
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.updateWithAudit.mockResolvedValue({
        ...mockReceipt,
        ...updateDto,
      });

      await service.update(mockReceipt._id, updateDto, mockUserId);

      expect(purchaseReceiptRepository.updateWithAudit).toHaveBeenCalled();
    });

    it('should throw error when updating non-draft receipt', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        items: [],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);

      await expect(
        service.update(mockReceipt._id, {}, mockUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockReceipt._id, {}, mockUserId),
      ).rejects.toThrow('Only Draft receipts can be updated');
    });
  });

  describe('remove - Purchase Receipt Deletion Rules', () => {
    it('should allow deleting draft receipts', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.DRAFT,
        items: [],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);
      purchaseReceiptRepository.softDelete.mockResolvedValue({});

      await service.remove(mockReceipt._id, mockUserId);

      expect(purchaseReceiptRepository.softDelete).toHaveBeenCalledWith(
        mockReceipt._id,
      );
    });

    it('should throw error when deleting non-draft receipt', async () => {
      const mockReceipt = {
        _id: new Types.ObjectId().toHexString(),
        status: DocumentStatus.CONFIRMED,
        items: [],
      };

      purchaseReceiptRepository.findById.mockResolvedValue(mockReceipt);

      await expect(service.remove(mockReceipt._id, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(mockReceipt._id, mockUserId)).rejects.toThrow(
        'Only Draft receipts can be deleted',
      );
    });
  });
});
