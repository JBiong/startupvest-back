import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from 'src/controller/PaymentController/payment.controller';
import { PaymentService } from '../../service/PaymentService/payment.service';
import { InvoiceService } from 'src/service/InvoiceService/invoice.service';
import { Payment } from 'src/entities/PaymentEntity/payment.entity';
import { Invoice } from 'src/entities/InvoiceEntity/invoice.entity';
import { PaymentItem } from 'src/entities/InvoiceEntity/payment-item.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentItem, Invoice, User])],
  providers: [PaymentService, InvoiceService], // Register PaymentService and InvoiceService
  controllers: [PaymentController], // Register PaymentController
  exports: [PaymentService, InvoiceService, TypeOrmModule], // Export services and repositories for other modules
})
export class PaymentModule {}
