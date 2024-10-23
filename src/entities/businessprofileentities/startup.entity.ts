import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { User } from "src/entities/user.entity";
// import { StartupProfilePicture } from '../profilepictureentities/startupprofilepicture.entity';
import { FundingRound } from "../financialentities/funding.entity";
import { ProfilePicture } from "../profilepictureentities/profilepicture.entity";
import { BudgetProposal } from "../BudgetProposalEntity/budget-proposal.entity";
import { Customer } from "../CustomerEntity/customer.entity";
import { Expenses } from "../ExpenseEntity/expenses.entity";
import { Invoice } from "../InvoiceEntity/invoice.entity";
import { Item } from "../ItemEntity/item.entity";
import { Payment } from "../PaymentEntity/payment.entity";
import { Project } from "../ProjectEntity/project.entity";

@Entity()
export class Startup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  companyName: string;

  @Column({ length: 1000 })
  companyDescription: string;

  @Column({ length: 500 })
  foundedDate: string;

  @Column({ length: 500 })
  typeOfCompany: string;

  @Column({ length: 500 })
  numberOfEmployees: string;

  @Column({ length: 500 })
  phoneNumber: string;

  @Column({ length: 500 })
  contactEmail: string;

  @Column({ length: 500 , nullable: true })
  streetAddress: string;

  @Column({ length: 500 })
  country: string;

  @Column({ length: 500 })
  city: string;

  @Column({ length: 500 })
  state: string;

  @Column({ length: 500 })
  postalCode: string;

  @Column({ length: 500 })
  industry: string;

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

  @Column({ length: 500 })
  startupCode: string;

  @OneToMany(() => FundingRound, (fundingRound) => fundingRound.startup)
  fundingRounds: FundingRound[];

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.ceostartups)
  ceo: User;

  @ManyToOne(() => User, (user) => user.cfoStartups)
  cfo: User;

  @OneToOne(() => ProfilePicture, (profilePicture) => profilePicture.startup)
  profilePicture: ProfilePicture;

  // startupsphere
  @Column({
    name: "location_lat",
    type: "decimal",
    precision: 20,
    scale: 16,
    nullable: true,
  })
  locationLat: number;

  @Column({
    name: "location_lng",
    type: "decimal",
    precision: 20,
    scale: 16,
    nullable: true,
  })
  locationLng: number;

  @Column({ name: "location_name", nullable: true })
  locationName: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  bookmarks: number;

  @Column({ default: 0 })
  views: number;

  //finease
  @OneToMany(() => Customer, (customer) => customer.startup)
  customers: Customer[];

  @OneToMany(() => Expenses, (expenses) => expenses.startup)
  expenses: Expenses[];

  @OneToMany(() => Item, (item) => item.startup)
  items: Item[];

  @OneToMany(() => Invoice, (invoice) => invoice.startup)
  invoices: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.startup)
  payments: Payment[];

  @OneToMany(() => Project, (project) => project.startup)
  projects: Project[];

  @OneToMany(() => BudgetProposal, (budgetProposal) => budgetProposal.startup)
  budgetProposals: BudgetProposal[];
}
