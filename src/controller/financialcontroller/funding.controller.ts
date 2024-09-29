import { Controller, Post, Body, Get, Param, NotFoundException, UnauthorizedException, Req, InternalServerErrorException, HttpException, HttpStatus, Logger, Query, Put, Delete, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FundingRoundService } from 'src/service/financialservice/funding.service';
import { FundingRound } from 'src/entities/financialentities/funding.entity';
import { StartupService } from 'src/service/businessprofileservice/startup.service';
import { UserService } from 'src/service/user.service';
import * as jwt from 'jsonwebtoken';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';
import { InvestorService } from 'src/service/businessprofileservice/investor.service';
import { InvestorData } from 'src/service/financialservice/funding.service';

@Controller('funding-rounds')
export class FundingRoundController {
  private readonly logger = new Logger(FundingRoundController.name);

  constructor(
    private readonly startupService: StartupService,
    private readonly userService: UserService,
    private readonly investorService: InvestorService,
    private readonly fundingRoundService: FundingRoundService
  ) { }

  private getUserIdFromToken(authorizationHeader?: string): number {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, 'secretKey');

    return payload.userId;
  }

  @Get('by-ids')
  async getInvestorsByIds(@Query('ids') ids: string): Promise<Investor[]> {
    const idArray = ids.split(',').map(id => parseInt(id, 10));
    return this.investorService.findByIds(idArray);
  }

  @Post('createfund')
  async createFundingRound(@Req() request: Request, @Body() fundingRoundData: Partial<FundingRound>, @Body('investors') investors: Investor[], @Body('shares') shares: number[], @Body('titles') titles: string[], userId: number): Promise<FundingRound> {
    try {
      this.logger.log('Received funding round data:', JSON.stringify(fundingRoundData));

      const startupId = fundingRoundData.startup?.id;
      if (!startupId) {
        throw new HttpException('Startup ID is required', HttpStatus.BAD_REQUEST);
      }

      const investorIds = fundingRoundData.investors?.map(investor => investor.id) || [];
      this.logger.log('Extracted investor IDs:', investorIds);

      const userId = this.getUserIdFromToken(request.headers['authorization']);
      const createdFunding = await this.fundingRoundService.create(startupId, fundingRoundData as FundingRound, investorIds, shares, titles, userId);
      this.logger.log('Funding round created:', JSON.stringify(createdFunding));

      return createdFunding;
      
    } catch (error) {
      this.logger.error('Failed to create funding round:', error);
      throw new HttpException('Failed to create funding round', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all')
  async findAll() {
    try {
      const fundingRounds = await this.fundingRoundService.findAll();
      if (!fundingRounds || fundingRounds.length === 0) {
        throw new NotFoundException('No funding rounds found');
      }
      return fundingRounds;
    } catch (error) {
      this.logger.error('Failed to fetch funding rounds:', error);
      throw new HttpException('Failed to fetch funding rounds', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get(':id')
  async findById(@Param('id') id: number): Promise<FundingRound> {
    const fundingRound = await this.fundingRoundService.findById(id);
    if (!fundingRound) {
      throw new NotFoundException('Funding round not found');
    }
    return fundingRound;
  }

  @Put(':id')
  async updateFundingRound(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { updateData: Partial<FundingRound>, investors: { id: number; shares: number; title: string, totalInvestment: number }[] },
    @Req() request: Request // Add @Req to access the request object
  ): Promise<FundingRound> {
    try {
      const { updateData, investors } = body;

      // Retrieve the userId from the authorization token
      const userId = this.getUserIdFromToken(request.headers['authorization']);

      // Call the service method to update the funding round, passing the userId
      const updatedFundingRound = await this.fundingRoundService.update(id, updateData, investors, userId);
      return updatedFundingRound;
    } catch (error) {
      this.logger.error('Failed to update funding round:', error);
      throw new HttpException('Failed to update funding round', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/delete')
  async softDeleteFundingRound(@Param('id') id: number): Promise<void> {
    return this.fundingRoundService.softDelete(id);
  }

  @Get(':id/total-money-raised')
  async getTotalMoneyRaisedForStartup(@Param('id') startupId: number): Promise<{ totalMoneyRaised: number }> {
    try {
      const totalMoneyRaised = await this.fundingRoundService.getTotalMoneyRaisedForStartup(startupId);
      return { totalMoneyRaised };
    } catch (error) {
      throw new NotFoundException('Startup not found or error calculating total money raised');
    }
  }

  // @Get(':id/total-share')
  // async getTotalShareForInvestor(@Param('id') investorId: number): Promise<{ totalShare: number }> {
  //   try {
  //     const totalShare = await this.fundingRoundService.getTotalShareForInvestor(investorId);
  //     return { totalShare };
  //   } catch (error) {
  //     this.logger.error(`Error getting total share for investor: ${error.message}`);
  //     throw new NotFoundException('Investor not found or error calculating total share');
  //   }
  // }
  @Get(':investorId/company/:companyId/total-shares')
  async getTotalSharesForInvestor(
    @Param('investorId') investorId: number,
    @Param('companyId') companyId: number,
  ): Promise<number> {
    return this.fundingRoundService.getTotalSharesForInvestor(investorId, companyId);
  }

  @Get(':companyId/investors/all')
async getAllInvestorsDataOfAllTheCompany(@Param('companyId') companyId: number) {
    try {
        const investors = await this.fundingRoundService.getAllInvestorsDataOfAllTheCompany(companyId);
        // Return an empty array if no investors are found
        return investors.length ? investors : [];
    } catch (error) {
        this.logger.error(`Failed to fetch investors for company ${companyId}:`, error);
        throw new HttpException('Failed to fetch investors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

  // Remove this method as it duplicates functionality
// @Get('investors/all')
// async getAllInvestorsDataOfAllTheCompany(@Param('companyId') companyId: number) {
//   return this.fundingRoundService.getAllInvestorsDataOfAllTheCompany(companyId);
// }

// Use this single endpoint to fetch all investors for a specific company
@Get('investors/company/:companyId')
async getAllInvestorDataByEachCompany(@Param('companyId') companyId: number): Promise<InvestorData[]> {
  try {
    const investors = await this.fundingRoundService.getAllInvestorDataByEachCompany(companyId);
    if (investors.length === 0) {
      return [];
    }
    return investors;
  } catch (error) {
    this.logger.error(`Failed to fetch investors for company ${companyId}:`, error);
    throw new HttpException('Failed to fetch investors', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

// @Get('total-funded-per-month/:startupId')
//   async getTotalFundedPerMonth(@Param('startupId') startupId: number) {
//     return this.fundingRoundService.getTotalFundedPerMonth(startupId);
//   }
@Get('monthly-funding/:userId')
    async getMonthlyFunding(@Param('userId') userId: number, @Query('year') year: number) {
        return this.fundingRoundService.getTotalMonthlyFunding(userId, year);
    }

    @Get('company-monthly-funding/:companyId')
    async getCompanyMonthlyFunding(@Param('companyId') companyId: number, @Query('year') year: number) {
        return this.fundingRoundService.getTotalMonthlyFundingByCompany(companyId, year);
    }
}

