import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BudgetBreakdown } from './budget-breakdown.entity';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
export class BudgetProposal {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  proposalTitle: string;

  @Column()
  proposalNumber: string;

  @Column('int')
  totalBudget: number;

  @Column()
  budgetPeriod: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  justification: string;

  @Column()
  potentialRisk: string;

  @Column()
  strategy: string;

  @Column()
  alternative: string;

  @Column({ default: 'Pending' })
  status: string;

  @Column({ nullable: true })
  ceoComment: string;

  @ManyToOne(() => User, (user) => user.budgetProposal, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @OneToMany(
    () => BudgetBreakdown,
    (budgetBreakdown) => budgetBreakdown.budgetProposal,
  )
  budgetBreakdown: BudgetBreakdown[];

  @ManyToOne(() => Startup, (startup) => startup.budgetProposals, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startup: Startup;
}
