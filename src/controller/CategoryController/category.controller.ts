import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/CategoryDto/create-category.dto';
import { CategoryService } from 'src/service/CategoryService/category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return this.categoryService.findAllByUser(parseInt(userId, 10));
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.categoryService.findAllByCfo(+cfoId);
  }
}
