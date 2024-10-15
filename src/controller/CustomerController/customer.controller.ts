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
import { CreateCustomerDto } from 'src/dto/CustomerDto/create-customer.dto';
import { UpdateCustomerDto } from 'src/dto/CustomerDto/update-customer.dto';
import { CustomerService } from 'src/service/CustomerService/customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.customerService.findAllByStartup(+startupId);
  }

  @Post()
  create(@Request() req, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(req.user.id, createCustomerDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.customerService.findAllByCeo(+ceoId);
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.customerService.findAllByCfo(+cfoId);
  }
}
