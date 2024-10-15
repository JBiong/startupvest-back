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
import { CreateInvoiceDto } from '../../dto/InvoiceDto/create-invoice.dto';
import { UpdateInvoiceDto } from '../../dto/InvoiceDto/update-invoice.dto';
import { InvoiceService } from 'src/service/InvoiceService/invoice.service';
import * as jwt from 'jsonwebtoken';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  private getUserIdFromToken(authorizationHeader?: string): number {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }
    const token = authorizationHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    return payload.userId;
  }

  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Post()
  create(@Request() req, @Body() createInvoiceDto: CreateInvoiceDto) {
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.invoiceService.create(userId, createInvoiceDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(+id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(+id);
  }

  @Get('customer/:customerId')
  findByCustomerId(@Param('customerId') customerId: number) {
    return this.invoiceService.findByCustomerId(customerId);
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.invoiceService.findAllByCfo(+cfoId);
  }
  
}
