import { Body, Controller, Delete, Get, Param, Post, Request, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/CategoryDto/create-category.dto';
import { CategoryService } from 'src/service/CategoryService/category.service';
import * as jwt from "jsonwebtoken";

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  private getUserIdFromToken(authorizationHeader?: string): number {
    if (!authorizationHeader) {
      throw new UnauthorizedException("Authorization header is required");
    }
    const token = authorizationHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    return payload.userId;
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Post()
  create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.categoryService.create(userId, createCategoryDto);
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
