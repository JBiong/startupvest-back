import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { CreateItemDto } from 'src/dto/ItemDto/create-item.dto';
import { UpdateItemDto } from 'src/dto/ItemDto/update-item.dto';
import { ItemService } from 'src/service/ItemService/item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.itemService.findAllByStartup(+startupId);
  }

  @Post()
  create(@Request() req, @Body() createItemDto: CreateItemDto) {
    return this.itemService.create(req.user.id, createItemDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.itemService.findAllByCeo(+ceoId);
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.itemService.findAllByCfo(+cfoId);
  }
}
