import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from 'src/controller/InvoiceController/invoice.controller';
import { InvoiceService } from 'src/service/InvoiceService/invoice.service';
import { Invoice } from 'src/entities/InvoiceEntity/invoice.entity';
import { PaymentItem } from 'src/entities/InvoiceEntity/payment-item.entity';
import { InvoiceItem } from 'src/entities/InvoiceEntity/invoice-item.entity'; // Import InvoiceItem
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      User,
      Startup,
      PaymentItem,
      InvoiceItem,
    ]), // Register entities used in the service
  ],
  controllers: [InvoiceController], // Register the controller
  providers: [InvoiceService], // Register the service
  exports: [InvoiceService], // Export the service if other modules need it
})
export class InvoiceModule {}
