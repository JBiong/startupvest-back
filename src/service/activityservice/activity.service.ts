//Activity service 
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/entities/activityentities/activity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>
        
    ) {}

    async logFundActivity( companyId: number, fundId: number, activityType: string, description: string): Promise<Activity> {
        const activity = this.activityRepository.create({  companyId, fundId, activityType, description });
        return this.activityRepository.save(activity);
    }

    async getRecentActivities(companyId: number, limit: number = 10): Promise<Activity[]> {
        return this.activityRepository.find({
            where: { companyId },
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
    
}
