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
import { CreateInvoiceDto } from '../../dto/InvoiceDto/create-invoice.dto';
import { UpdateInvoiceDto } from '../../dto/InvoiceDto/update-invoice.dto';
import { InvoiceService } from 'src/service/InvoiceService/invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

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
    return this.invoiceService.create(req.user.id, createInvoiceDto);
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
