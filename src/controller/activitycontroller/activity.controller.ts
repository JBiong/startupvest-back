import { Controller, Get, Query, Param } from '@nestjs/common';
import { ActivityService } from 'src/service/activityservice/activity.service';
import { Activity } from 'src/entities/activityentities/activity.entity';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':companyId/recent')
  async getRecentActivities(
    @Param('companyId') companyId: number,
    @Query('limit') limit: number = 10
  ): Promise<Activity[]> {
    return this.activityService.getRecentActivities(companyId, limit);
  }

  @Get('all-recent') // New endpoint for all recent activities
  async getAllRecentActivities(
    @Query('limit') limit: number = 10
  ): Promise<Activity[]> {
    return this.activityService.getAllRecentActivities(limit);
  }
}
