import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../CustomerEntity/customer.entity';
import { ProjectUser } from './project-user.entity';
import { ProjectResource } from './project-resource.entity';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  projectName: string;

  @Column()
  projectCode: string;

  @Column()
  billingMethod: string;

  @Column()
  description: string;

  @Column('int')
  totalExpenses: number;

  @ManyToOne(() => User, (user) => user.project, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.projects, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  projectUsers: ProjectUser[];

  @OneToMany(
    () => ProjectResource,
    (projectResource) => projectResource.project,
  )
  projectResources: ProjectResource[];

  @ManyToOne(() => Startup, (startup) => startup.projects, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startup: Startup;
}
