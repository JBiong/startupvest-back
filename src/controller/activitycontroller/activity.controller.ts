//Activity controller
// src/activity/activity.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ActivityService } from 'src/service/activityservice/activity.service';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':companyId/recent')
  async getRecentActivities(@Param('companyId') companyId: number, @Query('limit') limit: number) {
    return this.activityService.getRecentActivities(companyId, limit || 10);
  }
  
  
}
