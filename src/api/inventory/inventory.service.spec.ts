import { InventoryService } from './inventory.service';
import { ProductTrackingType } from '../../common/enums/erp.enum';
import { Types } from 'mongoose';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: any;
  let productRepository: any;

  beforeEach(() => {
    inventoryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      findBySerialNumber: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
    };

    productRepository = {
      findById: jest.fn(),
    };

    service = new InventoryService(inventoryRepository, productRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('increaseStock (Private Logic)', () => {
    it('should use _increaseSimple logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();

      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.SIMPLE,
      });
      inventoryRepository.findOne.mockResolvedValue(null);
      inventoryRepository.create.mockResolvedValue({});

      await service.increaseStock(productId, warehouseId, 10);

      expect(inventoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 10 }),
      );
    });

    it('should use _increaseSerialized logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();

      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.SERIALIZED,
      });
      inventoryRepository.findBySerialNumber.mockResolvedValue(null);
      inventoryRepository.create.mockResolvedValue({});

      await service.increaseStock(productId, warehouseId, 2, {
        serial_numbers: ['S1', 'S2'],
      });

      expect(inventoryRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should use _increaseLot logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();

      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.LOT_TRACKED,
      });
      inventoryRepository.findOne.mockResolvedValue(null);
      inventoryRepository.create.mockResolvedValue({});

      await service.increaseStock(productId, warehouseId, 100, {
        lot_code: 'LOT123',
      });

      expect(inventoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lot_code: 'LOT123',
          quantity: 100,
        }),
      );
    });

    it('should use _increaseExpirable logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();

      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.EXPIRABLE,
      });
      inventoryRepository.findOne.mockResolvedValue(null);
      inventoryRepository.create.mockResolvedValue({});

      const date = new Date();
      await service.increaseStock(productId, warehouseId, 50, {
        expiration_date: date,
      });

      expect(inventoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiration_date: date,
          quantity: 50,
        }),
      );
    });
  });

  describe('decreaseStock (Private Logic)', () => {
    it('should use _decreaseSimple logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();
      const mockInv = { quantity: 20, save: jest.fn() };

      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.SIMPLE,
      });
      inventoryRepository.findOne.mockResolvedValue(mockInv);

      await service.decreaseStock(productId, warehouseId, 5);

      expect(mockInv.quantity).toBe(15);
      expect(mockInv.save).toHaveBeenCalled();
    });

    it('should use _decreaseSerialized logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();
      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.SERIALIZED,
      });
      inventoryRepository.findOne.mockResolvedValue({
        _id: 'inv1',
        quantity: 1,
      });
      inventoryRepository.delete.mockResolvedValue({});

      await service.decreaseStock(productId, warehouseId, 1, {
        serial_numbers: ['S1'],
      });

      expect(inventoryRepository.delete).toHaveBeenCalledWith('inv1');
    });

    it('should use _decreaseLot logic', async () => {
      const productId = new Types.ObjectId().toHexString();
      const warehouseId = new Types.ObjectId().toHexString();
      const mockInv = { quantity: 100, save: jest.fn() };
      productRepository.findById.mockResolvedValue({
        tracking_type: ProductTrackingType.LOT_TRACKED,
      });
      inventoryRepository.findOne.mockResolvedValue(mockInv);

      await service.decreaseStock(productId, warehouseId, 10, {
        lot_code: 'L1',
      });

      expect(mockInv.quantity).toBe(90);
      expect(mockInv.save).toHaveBeenCalled();
    });
  });
});
