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
import { CreatePaymentDto } from 'src/dto/PaymentDto/create-payment.dto';
import { UpdatePaymentDto } from 'src/dto/PaymentDto/update-payment.dto';
import { PaymentService } from 'src/service/PaymentService/payment.service';
import * as jwt from "jsonwebtoken";

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.paymentService.findAllByStartup(+startupId);
  }

  @Post()
  create(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.paymentService.create(userId, createPaymentDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.paymentService.findAllByCeo(+ceoId);
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.paymentService.findAllByCfo(+cfoId);
  }
}
