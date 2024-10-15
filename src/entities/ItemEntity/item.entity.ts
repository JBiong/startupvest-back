import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { InvoiceItem } from '../InvoiceEntity/invoice-item.entity';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  unit: string;

  @Column()
  description: string;

  @Column('float')
  price: number;

  @ManyToOne(() => User, (user) => user.items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Startup, (startup) => startup.items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startup: Startup;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.item)
  invoiceItems: InvoiceItem[];
}
