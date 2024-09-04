import { Controller, Get, Param } from '@nestjs/common';
import { CapTableInvestorService } from 'src/service/financialservice/capinvestor.service';

@Controller('cap-table-investor')
export class CapTableInvestorController {
  constructor(private readonly capTableInvestorService: CapTableInvestorService) {}

  @Get(':capTableId')
  async getInvestorInformation(@Param('capTableId') capTableId: number) {
    return this.capTableInvestorService.getInvestorInformation(capTableId);
  }

  // You can add more endpoints for fetching shares, titles, etc.
}
