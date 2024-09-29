import { Controller, Post, Body, Req, UnauthorizedException, Get, Param, Query, Put } from '@nestjs/common';
import { StartupService } from 'src/service/businessprofileservice/startup.service';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { UserService } from 'src/service/user.service';

@Controller('startups')
export class StartupsController {
  constructor(
    private readonly startupService: StartupService,
    private readonly userService: UserService, // inject UserService
  ) { }

  private getUserIdFromToken(authorizationHeader?: string): number {
   
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }
    const token = authorizationHeader.replace('Bearer ', '');
   
    const payload = jwt.verify(token, 'secretKey');
    return payload.userId;
  }

  @Post('create')
  async create(@Req() request: Request, @Body() startupData: Startup): Promise<any> {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    await this.startupService.create(userId, startupData);
    return { message: 'Startup created successfully' };
  }

  @Get()
  findAll(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    return this.startupService.findAll(userId);
  }

  @Get('all')
  async findAllStartups(): Promise<Startup[]> {
    return this.startupService.findAllStartups();
  }

  // In StartupsController
  // @Get()
  // findAll() {
  //   return this.startupService.findAll();
  // }

  // @Get()
  // findAll(@Query('userId') userId: number) {
  //   return this.startupService.findAll(userId);
  // }

  @Put(':id')
  async update(@Param('id') id: number, @Body() startupData: Startup): Promise<Startup> {
    return this.startupService.update(Number(id), startupData);
  }

  @Put(':id/delete')
  async softDelete(@Param('id') id: number): Promise<void> {
    return this.startupService.softDelete(Number(id));
  }



  // other methods...
}