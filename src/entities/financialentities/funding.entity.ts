import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, CreateDateColumn } from 'typeorm';
import { Startup } from '../businessprofileentities/startup.entity';
import { Investor } from '../businessprofileentities/investor.entity';
import { CapTableInvestor } from './capInvestor.entity';

@Entity()
export class FundingRound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  fundingType: string;

  @Column({ length: 500 })
  announcedDate: string;

  @Column({ length: 500, nullable: true })
  closedDate: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  targetFunding: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  preMoneyValuation: number;

  @Column({ length: 500 })
  moneyRaisedCurrency: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 1 }) // Default minimum share value
  minimumShare: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()  // Automatically adds the current timestamp when the row is created
  createdAt: Date;

  //CAP TABLE
  @ManyToOne(() => Startup, startup => startup.fundingRounds)
  @JoinColumn({ name: 'startupId' }) // Explicitly name the foreign key column
  startup: Startup;

  @ManyToMany(() => Investor)
  @JoinTable()
  investors: Investor[];

  @Column()
  moneyRaised: number;

  @OneToMany(() => CapTableInvestor, (capTableInvestor) => capTableInvestor.capTable)
  capTableInvestors: CapTableInvestor[];
}
