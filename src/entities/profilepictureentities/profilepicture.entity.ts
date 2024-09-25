import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user.entity';
import { Startup } from '../businessprofileentities/startup.entity';
import { Investor } from '../businessprofileentities/investor.entity';
// import { User } from './user.entity';

@Entity()
export class ProfilePicture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'mediumblob' })
  data: Buffer;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => Startup, (startup) => startup.profilePicture)
  @JoinColumn()
  startup: Startup;

  @OneToOne(() => Investor, (investor) => investor.profilePicture)
  @JoinColumn()
  investor: Investor;
  contentType: string;
}
