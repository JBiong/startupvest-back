import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Expenses } from '../ExpenseEntity/expenses.entity';
import { User } from '../user.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  categoryName: string;

  @OneToMany(() => Expenses, (expenses) => expenses.category)
  expense: Expenses[];

  @ManyToOne(() => User, (user) => user.categories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
