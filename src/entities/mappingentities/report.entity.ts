import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  generated_by: number;

  @Column()
  name: string;

  @Column()
  file_type: string;

  @Column()
  url: string;

  @Column({ type: "timestamp", default: () => "now()" })
  timestamp: Date;
}
