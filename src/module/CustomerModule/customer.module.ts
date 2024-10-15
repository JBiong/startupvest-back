import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from 'src/controller/CustomerController/customer.controller';
import { CustomerService } from 'src/service/CustomerService/customer.service';
import { Customer } from 'src/entities/CustomerEntity/customer.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, User, Startup]), // Registering all necessary entities
  ],
  controllers: [CustomerController], // Registering the controller
  providers: [CustomerService], // Registering the service
  exports: [CustomerService], // Exporting the service if needed in other modules
})
export class CustomerModule {}
