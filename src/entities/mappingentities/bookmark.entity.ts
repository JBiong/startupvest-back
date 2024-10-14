import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Investor } from "../businessprofileentities/investor.entity";
import { Startup } from "../businessprofileentities/startup.entity";
import { User } from "../user.entity";

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Startup, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "startup_id" })
  startup?: Startup;

  @ManyToOne(() => Investor, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "investor_id" })
  investor?: Investor;

  @Column({ type: "timestamp", default: () => "now()" })
  timestamp: Date;
}
