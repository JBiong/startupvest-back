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
} from '@nestjs/common';
import { CreateExpensesDto } from 'src/dto/ExpenseDto/create-expenses.dto';
import { UpdateExpensesDto } from 'src/dto/ExpenseDto/update-expenses.dto';
import { ExpensesService } from 'src/service/ExpenseService/expenses.service';
import * as jwt from "jsonwebtoken";

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

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
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(+id);
  }

  @Post()
  create(@Request() req, @Body() createExpensesDto: CreateExpensesDto) {
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.expensesService.create(userId, createExpensesDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpensesDto: UpdateExpensesDto,
  ) {
    return this.expensesService.update(+id, updateExpensesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.expensesService.findAllByCeo(Number(ceoId));
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.expensesService.findAllByCfo(Number(cfoId));
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.expensesService.findAllByStartup(Number(startupId));
  }
}
