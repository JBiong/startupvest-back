import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Payment } from '../PaymentEntity/payment.entity';
import { Invoice } from './invoice.entity';

@Entity()
export class PaymentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  amount: number;

  @ManyToOne(() => Payment, (payment) => payment.paymentItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @ManyToOne(() => Invoice, (invoice) => invoice.paymentItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;
}
