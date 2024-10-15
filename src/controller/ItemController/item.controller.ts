import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateItemDto } from "src/dto/ItemDto/create-item.dto";
import { UpdateItemDto } from "src/dto/ItemDto/update-item.dto";
import { ItemService } from "src/service/ItemService/item.service";
import * as jwt from "jsonwebtoken";

@Controller("item")
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

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
    return this.itemService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.itemService.findOne(+id);
  }

  @Get("startup/:startupId")
  findAllByStartup(@Param("startupId") startupId: string) {
    return this.itemService.findAllByStartup(+startupId);
  }

  @Post()
  create(@Request() req, @Body() createItemDto: CreateItemDto) {
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.itemService.create(userId, createItemDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.itemService.remove(+id);
  }

  @Get("ceo/:ceoId")
  findAllByCeo(@Param("ceoId") ceoId: string) {
    return this.itemService.findAllByCeo(+ceoId);
  }

  @Get("cfo/:cfoId")
  findAllByCfo(@Param("cfoId") cfoId: string) {
    return this.itemService.findAllByCfo(+cfoId);
  }
}
