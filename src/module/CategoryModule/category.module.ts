import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from 'src/controller/CategoryController/category.controller';
import { CategoryService } from 'src/service/CategoryService/category.service';
import { Category } from 'src/entities/CategoryEntity/category.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService], 
})
export class CategoryModule {}
