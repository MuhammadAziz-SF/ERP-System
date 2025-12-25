import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from '../../core/repository/product.repository';
import { ProductTrackingType } from '../../common/enums/erp.enum';
import { Types } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    if (createProductDto.sku) {
      createProductDto.sku = createProductDto.sku.toUpperCase();
    }
    const existingSku = await this.productRepository.findBySku(
      createProductDto.sku,
    );
    if (existingSku) {
      throw new ConflictException(
        `Product with SKU ${createProductDto.sku} already exists`,
      );
    }
    if (
      createProductDto.tracking_type === ProductTrackingType.VARIANT &&
      (!createProductDto.variant_attributes ||
        createProductDto.variant_attributes.length === 0)
    ) {
      throw new BadRequestException(
        'Variant parent must have variant attributes defined',
      );
    }

    if (createProductDto.parent_product_id) {
      const parent = await this.productRepository.findById(
        createProductDto.parent_product_id,
      );
      if (!parent) {
        throw new NotFoundException(`Parent product not found`);
      }
      if (parent.tracking_type !== ProductTrackingType.VARIANT) {
        throw new BadRequestException(
          'Parent product must have tracking type VARIANT',
        );
      }
    }

    const productData: any = { ...createProductDto };
    if (createProductDto.parent_product_id) {
      productData.parent_product_id = new Types.ObjectId(
        createProductDto.parent_product_id,
      );
    }
    return this.productRepository.createWithAudit(productData, userId);
  }

  async findAll() {
    return this.productRepository.findAll({ is_active: true } as any);
  }

  async findOne(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findBySku(
        updateProductDto.sku,
      );
      if (existingSku) {
        throw new ConflictException(
          `Product with SKU ${updateProductDto.sku} already exists`,
        );
      }
      const isUsed = await this.productRepository.checkUsageInDocuments(id);
      if (isUsed) {
        throw new BadRequestException(
          'Cannot change SKU of a product that has been used in documents',
        );
      }
    }

    if (
      updateProductDto.tracking_type &&
      updateProductDto.tracking_type !== product.tracking_type
    ) {
      const isUsed = await this.productRepository.checkUsageInDocuments(id);
      if (isUsed) {
        throw new BadRequestException(
          'Cannot change tracking type of a product that has been used in documents',
        );
      }
    }

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.parent_product_id) {
      updateData.parent_product_id = new Types.ObjectId(
        updateProductDto.parent_product_id,
      );
    }

    return this.productRepository.updateWithAudit(id, updateData, userId);
  }

  async remove(id: string, userId: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const isUsed = await this.productRepository.checkUsageInDocuments(id);

    if (isUsed) {
      return this.productRepository.updateWithAudit(
        id,
        { is_active: false },
        userId,
      );
    } else {
      return this.productRepository.softDelete(id);
    }
  }
}
