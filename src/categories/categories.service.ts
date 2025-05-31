import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from '../users/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private catRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto, user: User) {
    const category = this.catRepo.create({ ...dto, user });
    return this.catRepo.save(category);
  }

  async findAll(userId: number) {
    return this.catRepo.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }
}
