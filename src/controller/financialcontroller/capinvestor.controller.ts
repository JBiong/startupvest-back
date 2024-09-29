import { Controller, Get, Param, Put, Req, UnauthorizedException } from '@nestjs/common';
import { CapTableInvestorService } from 'src/service/financialservice/capinvestor.service';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken

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

  @Get(':capTableId')
  async getInvestorInformation(@Param('capTableId') capTableId: number) {
    return this.capTableInvestorService.getInvestorInformation(capTableId);
  }

  @Get(':userId/top')
async getTopInvestorByCapTable(@Req() request: Request) {
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
