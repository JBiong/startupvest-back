import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Investor } from '../businessprofileentities/investor.entity';
import { FundingRound } from './funding.entity';
import { User } from '../user.entity';

@Entity()
export class CapTableInvestor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FundingRound, (fundingRound) => fundingRound.capTableInvestors, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'capTableId' }) // Explicitly name the foreign key column
  capTable: FundingRound;

  @ManyToOne(() => Investor, (investor) => investor.capTableInvestors, { nullable: false })
  @JoinColumn({ name: 'investorId' }) // Explicitly name the foreign key column
  investor: Investor;

  @Column({ length: 100 })
  title: string;

  @Column()
  shares: number;

  @Column()
  totalInvestment: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  investorRemoved: boolean;

  @ManyToOne(() => User, (user) => user.capTableInvestor)
    user: User;

  @Column({ default: 'accepted' }) // Default status to 'pending'
  status: string;

  @CreateDateColumn()  // Automatically adds the current timestamp when the row is created
  createdAt: Date;
}
