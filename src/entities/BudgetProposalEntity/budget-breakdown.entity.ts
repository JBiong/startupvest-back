import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BudgetProposal } from './budget-proposal.entity';

@Entity()
export class BudgetBreakdown {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  proposalCategory: string;

  @Column('int')
  allocatedAmount: number;

  @Column()
  description: string;

  @ManyToOne(
    () => BudgetProposal,
    (budgetProposal) => budgetProposal.budgetBreakdown,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  budgetProposal: BudgetProposal;
}
