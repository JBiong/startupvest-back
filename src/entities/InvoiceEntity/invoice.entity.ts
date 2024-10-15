import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Customer } from '../CustomerEntity/customer.entity';
import { InvoiceItem } from './invoice-item.entity';
import { PaymentItem } from './payment-item.entity';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
@Unique(['invoiceNumber'])
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  invoiceNumber: string;

  @Column()
  dueDate: string;

  @Column('float')
  total: number;

  @Column({ default: 'pending' })
  status: string;

  @Column()
  balanceDue: number;

  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.invoices, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  items: InvoiceItem[];

  @OneToMany(() => PaymentItem, (paymentItem) => paymentItem.invoice)
  paymentItems: PaymentItem[];

  @ManyToOne(() => Startup, (startup) => startup.invoices, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startup: Startup;
}
