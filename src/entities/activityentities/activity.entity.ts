//Activity Entity
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: string;

    @Column({ nullable: true })
    details: string;

    @CreateDateColumn({ type: 'timestamp' })
    timestamp: Date; // Automatically set the current date and time

    @ManyToOne(() => User, (user) => user.activities)
    user: User;
}
