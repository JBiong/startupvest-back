//Activity controller
// src/activity/activity.controller.ts
import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  UnauthorizedException,
  Req,
} from "@nestjs/common";
import { ActivityService } from "src/service/activityservice/activity.service";
import * as jwt from "jsonwebtoken"; // Import jsonwebtoken
import { Activity } from "src/entities/activityentities/activity.entity";

@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private getUserIdFromToken(authorizationHeader?: string): number {
    if (!authorizationHeader) {
      throw new UnauthorizedException("Authorization header is required");
    }
    const token = authorizationHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

    return payload.userId;
  }

  @Post()
  async createActivity(@Req() request: Request, @Body() recentData: Activity) {
    const userId = this.getUserIdFromToken(request.headers["authorization"]);
    return await this.activityService.createActivity(userId, recentData);
  }

  @Get()
  findAll(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers["authorization"]);
    return this.activityService.findAll(userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.activityService.findOne(+id);
  }
}
