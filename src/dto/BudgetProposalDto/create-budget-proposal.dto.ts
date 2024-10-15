import { Type, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';

class BudgetBreakdownDto {
  @IsNotEmpty()
  @IsString()
  proposalCategory: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  allocatedAmount: number;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class CreateBudgetProposalDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  proposalTitle: string;

  @IsNotEmpty()
  @IsString()
  proposalNumber: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  totalBudget: number;

  @IsNotEmpty()
  @IsString()
  budgetPeriod: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  justification: string;

  @IsNotEmpty()
  @IsString()
  potentialRisk: string;

  @IsNotEmpty()
  @IsString()
  strategy: string;

  @IsNotEmpty()
  @IsString()
  alternative: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BudgetBreakdownDto)
  budgetBreakdowns: BudgetBreakdownDto[];
}
