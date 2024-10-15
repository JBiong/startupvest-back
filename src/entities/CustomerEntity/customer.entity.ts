import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Invoice } from '../InvoiceEntity/invoice.entity';
import { Payment } from '../PaymentEntity/payment.entity';
import { Project } from '../ProjectEntity/project.entity';
import { type } from 'os';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  type: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  companyName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: number;

  @ManyToOne(() => User, (user) => user.customers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.customer)
  payments: Payment[];

  @OneToMany(() => Project, (project) => project.customer)
  projects: Project[];

  @ManyToOne(() => Startup, (startup) => startup.customers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startup: Startup;
}
