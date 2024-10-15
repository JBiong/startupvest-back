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
import { CreateCustomerDto } from 'src/dto/CustomerDto/create-customer.dto';
import { UpdateCustomerDto } from 'src/dto/CustomerDto/update-customer.dto';
import { CustomerService } from 'src/service/CustomerService/customer.service';
import * as jwt from 'jsonwebtoken';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.customerService.create(userId, createCustomerDto);
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
