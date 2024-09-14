<<<<<<< HEAD
//Activity controller
// src/activity/activity.controller.ts
import { Controller, Get, Query, Param, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { ActivityService } from 'src/service/activityservice/activity.service';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
=======
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ActivityService } from 'src/service/activityservice/activity.service';
>>>>>>> eead9b89f8b96f192ac616152898d533c773408d
import { Activity } from 'src/entities/activityentities/activity.entity';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

<<<<<<< HEAD
  // @Post('log')
  // async logActivity(@Body() activityData: { companyId: number; fundId: number; activityType: string; description: string }) {
  //   return this.activityService.logFundActivity(activityData.companyId, activityData.fundId, activityData.activityType, activityData.description);
  // }

  // @Get(':companyId/recent')
  // async getRecentActivities(@Param('companyId') companyId: number, @Query('limit') limit: number) {
  //   return this.activityService.getRecentActivities(companyId, limit || 10);
  // }

  private getUserIdFromToken(authorizationHeader?: string): number {
    console.log('Authorization Header:', authorizationHeader);

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Replace 'Bearer ' with an empty string to get the JWT.
    const token = authorizationHeader.replace('Bearer ', '');
    console.log('Token:', token);

    // Decode the JWT to get the payload.
    const payload = jwt.verify(token, 'secretKey');
    console.log('Payload:', payload);

    // Return the user's ID from the payload.
    return payload.userId;
  }
  
  @Post()
  async createActivity(@Req() request: Request, @Body() recentData: Activity) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    return await this.activityService.createActivity(userId, recentData);
  }

  // @Get()
  // async findAll() {
  //   return await this.activityService.findAll();
  // }

  @Get()
  findAll(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    return this.activityService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.activityService.findOne(+id);
  }
  
=======
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
>>>>>>> eead9b89f8b96f192ac616152898d533c773408d
}
