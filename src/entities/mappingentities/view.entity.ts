import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Investor } from "../businessprofileentities/investor.entity";
import { Startup } from "../businessprofileentities/startup.entity";

@Entity()
export class View {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id", nullable: true, default: null })
  user_id: number | null;

  @ManyToOne(() => Startup, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "startup_id" })
  startup?: Startup;

  @ManyToOne(() => Investor, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "investor_id" })
  investor?: Investor;

  @Column({ type: "timestamp", default: () => "now()" })
  timestamp: Date;
}
