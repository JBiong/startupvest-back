import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Category } from '../CategoryEntity/category.entity';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
export class Expenses {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  transactionDate: Date;

  @Column('int')
  amount: number;

  @Column()
  modeOfPayment: string;

  @Column({ unique: true })
  referenceNumber: string;

  @ManyToOne(() => Category, (category) => category.expense, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  category: Category;

  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  @ManyToOne(() => Startup, (startup) => startup.expenses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  startup: Startup;
}
