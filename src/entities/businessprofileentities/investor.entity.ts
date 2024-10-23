import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable, PrimaryColumn, BeforeInsert } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { FundingRound } from '../financialentities/funding.entity';
import { ProfilePicture } from '../profilepictureentities/profilepicture.entity';

import { CapTableInvestor } from '../financialentities/capInvestor.entity';
@Entity()
export class Investor {
  @PrimaryColumn()
  id: number;

  @Column({ length: 500 })
  firstName: string;

  @Column({ length: 500 })
  lastName: string;

  @Column({ length: 500 })
  emailAddress: string;

  @Column({ length: 500 })
  contactInformation: string;

  @Column({ length: 500 })
  gender: string;

  @Column({ length: 1000, nullable: true })
  biography: string;

  @Column({ length: 500, nullable: true })
  website: string;

  @Column({ length: 500, nullable: true })
  facebook: string;

  @Column({ length: 500, nullable: true })
  twitter: string;

  @Column({ length: 500, nullable: true })
  instagram: string;

  @Column({ length: 500, nullable: true })
  linkedIn: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToMany(() => FundingRound)
  fundingRounds: FundingRound[];

  @OneToMany(() => CapTableInvestor, capTableInvestor => capTableInvestor.investor)
  capTableInvestors: CapTableInvestor[];


  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => ProfilePicture, (profilePicture) => profilePicture.investor)
  profilePicture: ProfilePicture;

  @BeforeInsert()
  setIdFromUser() {
  console.log('Setting investor id from user id:', this.user.id);  // Log user id
  this.id = this.user.id;
  }

  // startupsphere
  @Column({ name: "location_lat", type: "decimal", precision: 20, scale: 16, nullable: true })
  locationLat: number;

  @Column({ name: "location_lng", type: "decimal", precision: 20, scale: 16, nullable: true })
  locationLng: number;

  @Column({ name: "location_name", nullable: true })
  locationName: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  bookmarks: number;

  @Column({ default: 0 })
  views: number;
}
