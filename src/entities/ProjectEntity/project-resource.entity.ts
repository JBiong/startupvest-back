import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class ProjectResource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  resourceCategory: string;

  @Column()
  subCategory: string;

  @Column('int')
  expense: number;

  @ManyToOne(() => Project, (project) => project.projectResources, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
