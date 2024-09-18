import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { Investor } from './businessprofileentities/investor.entity';
import { ProfilePicture } from './profilepictureentities/profilepicture.entity';
import { Activity } from './activityentities/activity.entity';
import { CapTableInvestor } from './financialentities/capInvestor.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  firstName: string;

  @Column({ length: 500 })
  lastName: string;

  @Column({ length: 500 })
  email: string;

  @Column({ length: 500 })
  contactNumber: string;

  @Column({ length: 500 })
  gender: string;

  // @Column({ length: 500 })
  // password: string;
  @Column({ length: 500, nullable: true }) // Make the password property optional
  password?: string;

  //Relationships

  @OneToMany(() => Startup, startup => startup.user)
  startups: Startup[];

  @OneToOne(() => Investor, investor => investor.user)
  @JoinColumn() 
  investor: Investor;

  @OneToMany(() => ProfilePicture, profilePicture => profilePicture.user)
  profilePicture: ProfilePicture; // This will create a foreign key in the ProfilePicture table

  @OneToMany(() => Activity, activities => activities.user)
  activities: Activity;

  @OneToMany(() => CapTableInvestor, capTableInvestor => capTableInvestor.user)
  capTableInvestor: CapTableInvestor;
}
