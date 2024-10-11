import { Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Param, Put, Query, Req, UnauthorizedException } from '@nestjs/common';
import { CapTableInvestorService } from 'src/service/financialservice/capinvestor.service';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { request } from 'http';
import { CapTableInvestor } from 'src/entities/financialentities/capInvestor.entity';

@Controller('cap-table-investor')
export class CapTableInvestorController {
  constructor(private readonly capTableInvestorService: CapTableInvestorService) {}

  private getUserIdFromToken(authorizationHeader?: string): number {
   

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }
    const token = authorizationHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, 'secretKey');
   
    return payload.userId;
  }

  @Get()
  findAll(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    return this.capTableInvestorService.findAll(userId);
  }
  @Get('all')
    async findAllInvestors(@Query('userId') userId: number): Promise<CapTableInvestor[]> {
        // Fetch investors filtered by user ID
        return this.capTableInvestorService.findAllInvestors(userId);
    }

    @Get('investor-requests/:investorId') // Assuming you have a route parameter for the investor ID
    async getInvestorRequests(@Param('investorId') investorId: number) {
        try {
            const requests = await this.capTableInvestorService.findAllInvestorRequests(investorId);
            return requests; // Return the filtered requests
        } catch (error) {
            console.error('Unable to fetch investor requests:', error);
            throw new InternalServerErrorException('Unable to fetch investor requests');
        }
    }
    


  @Get(':capTableId')
  async getInvestorInformation(@Param('capTableId') capTableId: number) {
    return this.capTableInvestorService.getInvestorInformation(capTableId);
  }

  @Get(':userId/top')
async getTopInvestorByCapTable(@Param('userId') userIdParam: number, @Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    const topInvestor = await this.capTableInvestorService.findTopInvestorByUser(userId);

    if (!topInvestor) {
        return { message: 'No investors found' };
    }

    return topInvestor; // Returns the name and total investment of the top investor
}


  @Put(':investorId/:capTableId')
  async removeInvestor(
    @Param('investorId') investorId: number,
    @Param('capTableId') capTableId: number
  ): Promise<void> {
    await this.capTableInvestorService.removeInvestor(investorId, capTableId);
  }

  // You can add more endpoints for fetching shares, titles, etc.
}
