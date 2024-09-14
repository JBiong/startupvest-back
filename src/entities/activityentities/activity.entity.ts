//Activity Entity
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    companyId: number; // ID of the company related to the fund

    @Column()
    fundId: number; // ID of the fund that was created, updated, or deleted

    @Column({ length: 50 })
    activityType: string; // "CREATE_FUND", "UPDATE_FUND", "DELETE_FUND"

    @Column('text')
    description: string; // A brief description of the activity

    @CreateDateColumn({ type: 'timestamp' })
    timestamp: Date; // Automatically set the current date and time
}
