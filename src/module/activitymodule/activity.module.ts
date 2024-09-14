//Activity module 
// src/activity/activity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from 'src/entities/activityentities/activity.entity';
import { ActivityService } from 'src/service/activityservice/activity.service';
import { ActivityController } from 'src/controller/activitycontroller/activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
