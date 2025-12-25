// src/common/repositories/base.repository.ts

import { Document, QueryFilter, Model, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: Partial<T>): Promise<T> {
    const createdEntity = new this.model(doc);
    return createdEntity.save();
  }

  async findAll(filter: QueryFilter<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { is_active: false, deleted_at: new Date() } as any,
        { new: true },
      )
      .exec();
  }

  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }
}
