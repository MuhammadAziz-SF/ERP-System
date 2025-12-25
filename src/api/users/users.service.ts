import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from '../../core/repository/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  create(createUserDto: CreateUserDto) {
    // In real app, hash password here
    return this.userRepository.create(createUserDto);
  }

  findAll() {
    return this.userRepository.findAll({ is_active: true } as any);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  remove(id: string) {
    return this.userRepository.softDelete(id);
  }
}
