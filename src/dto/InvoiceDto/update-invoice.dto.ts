import { Type, Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayNotEmpty, IsOptional } from 'class-validator';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class UpdateInvoiceDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId?: number;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}
