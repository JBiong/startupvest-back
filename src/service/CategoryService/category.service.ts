import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from 'src/dto/CategoryDto/create-category.dto';
import { Category } from 'src/entities/CategoryEntity/category.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: number) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async create(userId: number, createCategoryDto: CreateCategoryDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      user, // Associate the user with the category
    });

    return this.categoryRepository.save(newCategory);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.remove(category);
  }

    async findAllByUser(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
    });
  }
  
  async findAllByCfo(cfoId: number) {
    return this.categoryRepository.find({
      where: { user: { id: cfoId } },
    });
  }
}
