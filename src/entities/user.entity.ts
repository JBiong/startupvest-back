import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Startup } from "src/entities/businessprofileentities/startup.entity";
import { Investor } from "./businessprofileentities/investor.entity";
import { ProfilePicture } from "./profilepictureentities/profilepicture.entity";
import { Activity } from "./activityentities/activity.entity";
import { CapTableInvestor } from "./financialentities/capInvestor.entity";
import { timestamp } from "rxjs";
import { ValidateIf } from "class-validator";
import { BudgetProposal } from "./BudgetProposalEntity/budget-proposal.entity";
import { Category } from "./CategoryEntity/category.entity";
import { Customer } from "./CustomerEntity/customer.entity";
import { Expenses } from "./ExpenseEntity/expenses.entity";
import { Invoice } from "./InvoiceEntity/invoice.entity";
import { Item } from "./ItemEntity/item.entity";
import { Payment } from "./PaymentEntity/payment.entity";
import { Project } from "./ProjectEntity/project.entity";

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

  @CreateDateColumn()
  createdAt: Date;

  @ValidateIf((o) => o.role === "CFO")
  startupCode?: string;

  @Column({ length: 500, nullable: true })
  password?: string;

  @Column({ default: "CEO" })
  role: string;

  @Column({ default: false })
  isVerified: boolean; // New field to track verification status

  @Column({ nullable: true })
  resetPasswordToken?: string; // For storing the reset token (OTP)

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date; // For storing the token expiration time

  //Relationships

  @OneToMany(() => Startup, (startup) => startup.ceo)
  ceostartups: Startup[];

  @OneToMany(() => Startup, (startup) => startup.cfo)
  cfoStartups: Startup[];

  @OneToOne(() => Investor, (investor) => investor.user)
  @JoinColumn()
  investor: Investor;

  @OneToMany(() => ProfilePicture, (profilePicture) => profilePicture.user)
  profilePicture: ProfilePicture;

  @OneToMany(() => Activity, (activities) => activities.user)
  activities: Activity;

  @OneToMany(
    () => CapTableInvestor,
    (capTableInvestor) => capTableInvestor.user
  )
  capTableInvestor: CapTableInvestor;

  //finease

  @OneToMany(() => Item, (item) => item.user)
  items: Item[];

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => Expenses, (expenses) => expenses.user)
  expenses: Expenses[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Project, (project) => project.user)
  project: Project[];

  @OneToMany(() => BudgetProposal, (budgetProposal) => budgetProposal.user)
  budgetProposal: BudgetProposal[];
}
