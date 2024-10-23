import { Controller, Post, Body, Req, UnauthorizedException, Get, Param, Query, Put } from '@nestjs/common';
import { InvestorService } from 'src/service/businessprofileservice/investor.service';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { UserService } from 'src/service/user.service';
import { User } from 'src/entities/user.entity';

@Controller('investors')
export class InvestorsController {
  constructor(
    private readonly investorService: InvestorService,
    private readonly userService: UserService, // inject UserService
  ) { }

  private getUserIdFromToken(authorizationHeader?: string): number {
    
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
  
    return payload.userId;
  }

  @Post('create')
  async create(@Req() request: Request, @Body() userData: User): Promise<any> {
  const userId = this.getUserIdFromToken(request.headers['authorization']);
  const investor = await this.investorService.create(userId, userData);
  return { message: 'Investor created successfully', investor };
}


  @Get()
  findAllCreatedUser(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);

    return this.investorService.findAllCreatedUser(userId);
  }

  @Get('all')
  async findAllInvestors(): Promise<Investor[]> {
    return this.investorService.findAllInvestors();
  }

  @Get(':userId/ids')
  async getInvestorIds(@Param('userId') userId: number): Promise<number[]> {
    return this.investorService.getInvestorIds(userId);
  }
  
  @Get('by-ids')
  async getInvestorsByIds(@Query('ids') ids: string): Promise<Investor[]> {
    const idArray = ids.split(',').map(id => parseInt(id, 10));
    return this.investorService.findByIds(idArray);
  }


  @Get(':ids')
  findByIds(@Param('ids') ids: number[]) {
    return this.investorService.findByIds(ids);
  }


  // // In InvestorsController
  // @Get()
  // findAll() {
  //   return this.investorService.findAll();
  // }

  // @Get()
  // findAll(@Query('userId') userId: number) {
  //   return this.investorService.findAll(userId);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: number) {
  //   return this.investorService.findOne(id);
  // }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Investor> {
    return this.investorService.findOne(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() investorData: Investor): Promise<Investor> {
    return this.investorService.update(Number(id), investorData);
  }

  @Put(':id/delete')
  async softDelete(@Param('id') id: number): Promise<void> {
    return this.investorService.softDelete(Number(id));
  }

}