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
import { PaymentItem } from '../InvoiceEntity/payment-item.entity';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
@Unique(['paymentNumber']) // Enforce unique constraint for paymentNumber
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  dateOfPayment: string;

  @Column()
  paymentNumber: string;

  @Column()
  modeOfPayment: string;

  @Column()
  referenceNumber: string;

  @Column('float')
  totalAmount: number;

  @ManyToOne(() => Customer, (customer) => customer.payments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.payments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @OneToMany(() => PaymentItem, (paymentItem) => paymentItem.payment)
  paymentItems: PaymentItem[];

  @ManyToOne(() => Startup, (startup) => startup.payments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startup: Startup;
}
