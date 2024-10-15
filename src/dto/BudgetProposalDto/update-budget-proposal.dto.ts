import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetProposalDto } from './create-budget-proposal.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBudgetProposalDto extends PartialType(CreateBudgetProposalDto){}

export class UpdateBudgetProposalStatusDto {
    @IsNotEmpty()
    @IsString()
    status: string;
  
    @IsOptional()
    @IsString()
    ceoComment?: string;
  }