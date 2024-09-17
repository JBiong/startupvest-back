import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { CapTableInvestorService } from 'src/service/financialservice/capinvestor.service';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken

@Controller('cap-table-investor')
export class CapTableInvestorController {
  constructor(private readonly capTableInvestorService: CapTableInvestorService) {}

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

  @Get()
  findAll(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    return this.capTableInvestorService.findAll(userId);
  }

  @Get(':capTableId')
  async getInvestorInformation(@Param('capTableId') capTableId: number) {
    return this.capTableInvestorService.getInvestorInformation(capTableId);
  }

  // You can add more endpoints for fetching shares, titles, etc.
}
