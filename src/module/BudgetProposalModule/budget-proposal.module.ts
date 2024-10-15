import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetProposalController } from 'src/controller/BudgetProposalController/budget-proposal.controller';
import { BudgetProposalService } from 'src/service/BudgetProposalService/budget-proposal.service';
import { BudgetProposal } from 'src/entities/BudgetProposalEntity/budget-proposal.entity';
import { BudgetBreakdown } from 'src/entities/BudgetProposalEntity/budget-breakdown.entity'; // Importing BudgetBreakdown
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BudgetProposal, User, Startup, BudgetBreakdown]), // Added BudgetBreakdown entity
  ],
  providers: [BudgetProposalService],
  controllers: [BudgetProposalController],
})
export class BudgetProposalModule {}
