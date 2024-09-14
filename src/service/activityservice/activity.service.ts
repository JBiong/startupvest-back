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

        const recentactivity = this.activityRepository.create({ ...recentData, user: { id: userId } });
    
        return await this.activityRepository.save(recentactivity);
      }

      async findAll(userId: number): Promise<Activity[]> {
        return this.activityRepository.find({ where: { user: { id: userId }} });
      }
    
      async findOne(id: number) {
        return await this.activityRepository.findOneBy({ id });
      }
    
}