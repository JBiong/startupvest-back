import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

class PaymentItemDto {
  @IsNotEmpty()
  @IsNumber()
  invoiceId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
  
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsString()
  dateOfPayment: string;

  @IsNotEmpty()
  @IsString()
  paymentNumber: string;

  @IsNotEmpty()
  @IsString()
  modeOfPayment: string;

  @IsNotEmpty()
  @IsString()
  referenceNumber: string;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments: PaymentItemDto[];
}