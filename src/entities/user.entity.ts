import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { Investor } from './businessprofileentities/investor.entity';
import { ProfilePicture } from './profilepictureentities/profilepicture.entity';
import { Activity } from './activityentities/activity.entity';
import { CapTableInvestor } from './financialentities/capInvestor.entity';
import { timestamp } from 'rxjs';


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

  @CreateDateColumn()  // Automatically adds the current timestamp when the row is created
  createdAt: Date;

 

  // @Column({ length: 500 })
  // password: string;
  @Column({ length: 500, nullable: true }) // Make the password property optional
  password?: string;

  //Roles
  @Column({default: 'user'})
  role:string;

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
