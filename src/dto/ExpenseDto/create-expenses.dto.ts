import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsDate } from 'class-validator';

export class CreateExpensesDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;
  
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  transactionDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  modeOfPayment: string;

  @IsNotEmpty()
  @IsString()
  referenceNumber: string;

  startupId?: number;
}
