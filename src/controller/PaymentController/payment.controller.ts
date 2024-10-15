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
import { CreatePaymentDto } from 'src/dto/PaymentDto/create-payment.dto';
import { UpdatePaymentDto } from 'src/dto/PaymentDto/update-payment.dto';
import { PaymentService } from 'src/service/PaymentService/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
    return this.paymentService.create(req.user.id, createPaymentDto);
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
