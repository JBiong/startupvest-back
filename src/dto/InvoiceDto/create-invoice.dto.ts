import { Type, Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;
  
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @IsNotEmpty()
  @IsString()
  dueDate: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
