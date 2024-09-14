//Activity service 
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/entities/activityentities/activity.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>
        
    ) {}

    async createActivity(userId: number, recentData: Activity) {

<<<<<<< HEAD
        const recentactivity = this.activityRepository.create({ ...recentData, user: { id: userId } });
    
        return await this.activityRepository.save(recentactivity);
      }

      async findAll(userId: number): Promise<Activity[]> {
        return this.activityRepository.find({ where: { user: { id: userId }} });
      }
    
      async findOne(id: number) {
        return await this.activityRepository.findOneBy({ id });
      }
=======
    async getRecentActivities(companyId: number, limit: number = 10): Promise<Activity[]> {
        return this.activityRepository.find({
            where: { companyId },
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }

    async getAllRecentActivities(limit: number = 10): Promise<Activity[]> {
        return this.activityRepository.find({
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
>>>>>>> eead9b89f8b96f192ac616152898d533c773408d
    
}
