import { Injectable, NotFoundException, Logger, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundingRound } from 'src/entities/financialentities/funding.entity';
import { InvestorService } from '../businessprofileservice/investor.service';
import { CapTableInvestor } from 'src/entities/financialentities/capInvestor.entity';
import { ActivityService } from '../activityservice/activity.service';
import { title } from 'process';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';
import { share } from 'rxjs';
import { User } from 'src/entities/user.entity';

export interface InvestorData {
  id: number;
  name: string;
  title: string;
  shares: number;
  totalShares: number;
  percentage: number;
  totalInvestment: number;
}

@Injectable()
export class FundingRoundService {

  private readonly logger = new Logger(FundingRoundService.name);

  constructor(
    @InjectRepository(FundingRound)
    private readonly fundingRoundRepository: Repository<FundingRound>,
    private readonly investorService: InvestorService,
    @InjectRepository(CapTableInvestor)
    private readonly capTableInvestorRepository: Repository<CapTableInvestor>,
    private readonly activityService: ActivityService,
  ) { }

  async create(
    fundingId: number, 
    fundingRoundData: FundingRound, 
    investorIds: number[], 
    investorShares: number[], 
    investorTitles: string[], 
    userId: number // Add userId parameter
  ): Promise<FundingRound> {
      console.log('Investor IDs:', investorIds);
  
      // Fetch investors by their IDs
      const investors = await this.investorService.findByIds(investorIds);
      console.log('Fetched Investors:', investors);
  
      // Use minimumShare from fundingRoundData (passed during the creation)
      const minimumShare = fundingRoundData.minimumShare;
  
      // Calculate moneyRaised from investorShares array
      const moneyRaised = investorShares.reduce((acc, shares, index) => acc + (minimumShare * shares), 0);
  
      // Create the funding round entity
      const funding = this.fundingRoundRepository.create({
        ...fundingRoundData,
        startup: { id: fundingId },
        investors,
        moneyRaised // Associate investors with the funding round
      });
  
      const createdCapTable = await this.fundingRoundRepository.save(funding);
      console.log('Created Cap Table:', createdCapTable);
  
      // Create and save CapTableInvestor entities
      const capTableInvestors = investors.map((investor, index) => {
        const capTableInvestor = new CapTableInvestor();
        capTableInvestor.capTable = createdCapTable;
        capTableInvestor.investor = investor;
        capTableInvestor.title = investorTitles[index];
        capTableInvestor.shares = investorShares[index];
  
        // Add userId to the CapTableInvestor entity
        capTableInvestor.user = { id: userId } as User;
  
        // Calculate totalInvestment as minimumShare * shares
        capTableInvestor.totalInvestment = minimumShare * investorShares[index];
  
        return capTableInvestor;
      });
  
      // Save each CapTableInvestor entity
      await Promise.all(capTableInvestors.map(async (capTableInvestor) => {
        await this.capTableInvestorRepository.save(capTableInvestor);
        return this.findById(createdCapTable.id);
      }));
  
      return createdCapTable;
  }
  

  async findById(id: number): Promise<FundingRound> {
    try {
      const fundingRound = await this.fundingRoundRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['startup', 'capTableInvestors', 'capTableInvestors.investor'],
      });
  
      if (!fundingRound) {
        throw new NotFoundException('Funding round not found');
      }
  
      return fundingRound;
    } catch (error) {
      console.error('Error finding funding round by ID:', error);
      throw new NotFoundException('Funding round not found');
    }
  }

  async findAll(): Promise<FundingRound[]> {
    return this.fundingRoundRepository.find({
      where: { isDeleted: false },
      relations: ['startup', 'capTableInvestors', 'capTableInvestors.investor'],
    });
  }

  async update(
      id: number, 
      updateData: Partial<FundingRound>, 
      investorData: { id: number; shares: number; title: string; totalInvestment: number }[]
  ): Promise<FundingRound> {
      // Retrieve the existing funding round
      const fundingRound = await this.findById(id);
      if (!fundingRound) {
          throw new NotFoundException('Funding round not found');
      }

      // Retrieve the minimum share from the existing funding round
      const minimumShare = fundingRound.minimumShare;

      // Update the funding round with new data
      Object.assign(fundingRound, updateData);

      // Retrieve all existing cap table investors for this funding round
      const existingCapTableInvestors = await this.capTableInvestorRepository.find({
          where: { capTable: { id: fundingRound.id } },
          relations: ['investor'],
      });

      // Create a map for quick lookup
      const existingCapTableInvestorMap = new Map<number, CapTableInvestor>();
      existingCapTableInvestors.forEach(investor => existingCapTableInvestorMap.set(investor.investor.id, investor));

      const updatedCapTableInvestors: CapTableInvestor[] = [];

      // Update existing investors and add new investors
      for (const { id: investorId, shares, title, totalInvestment } of investorData) {
          let capTableInvestor = existingCapTableInvestorMap.get(investorId);
          
          if (capTableInvestor) {
              // Update existing investor shares and title
              capTableInvestor.shares = shares;
              capTableInvestor.title = title;
              capTableInvestor.totalInvestment = minimumShare * shares; // Ensure totalInvestment is correctly calculated
          } else {
              // Create new investor
              capTableInvestor = this.capTableInvestorRepository.create({
                  capTable: fundingRound, // Ensure capTable is set
                  investor: { id: investorId } as Investor,
                  shares: shares,
                  title: title,
                  totalInvestment: minimumShare * shares // Calculate totalInvestment
              });
          }

          // Add to updated investors list
          updatedCapTableInvestors.push(capTableInvestor);
      }

      // Save all updated and new investors to the cap table
      await this.capTableInvestorRepository.save(updatedCapTableInvestors);

      // Recalculate the money raised
      fundingRound.moneyRaised = updatedCapTableInvestors.reduce((acc, investor) => acc + investor.totalInvestment, 0);
      // fundingRound.moneyRaised = totalMoneyRaised;

      // Save the updated funding round
      const updatedFundingRound = await this.fundingRoundRepository.save(fundingRound);

      // Manually set the updated cap table investors into the updatedFundingRound for return
      updatedFundingRound.capTableInvestors = updatedCapTableInvestors;

      return updatedFundingRound;
  }

  async softDelete(id: number): Promise<void> {
    const fundingRound = await this.fundingRoundRepository.findOne({
      where: { id },
      relations: ['capTableInvestors']
    });
  
    if (!fundingRound) {
      throw new NotFoundException('Funding round not found');
    }
  
    // Mark funding round as deleted
    fundingRound.isDeleted = true;
  
    // Mark all related cap table investors as deleted
    fundingRound.capTableInvestors.forEach(investor => {
      investor.isDeleted = true;
    });
  
    // Soft delete the cap table investors
    await this.capTableInvestorRepository.save(fundingRound.capTableInvestors);
  
    // Save the updated funding round
    await this.fundingRoundRepository.save(fundingRound);
  }

  async investorRemoved(fundingRoundId: number, investorId: number): Promise<FundingRound> {
    // Retrieve the funding round by ID
    const fundingRound = await this.findById(fundingRoundId);
    if (!fundingRound) {
      throw new NotFoundException('Funding round not found');
    }
  
    // Find the CapTableInvestor entity for the given investor in this funding round
    const capTableInvestor = await this.capTableInvestorRepository.findOne({
      where: { capTable: fundingRound, investor: { id: investorId } },
    });
  
    if (!capTableInvestor) {
      throw new NotFoundException('Investor not found in this funding round');
    }
  
    // Soft delete the CapTableInvestor entity
    capTableInvestor.investorRemoved = true;
    await this.capTableInvestorRepository.save(capTableInvestor);
  
    // Recalculate the moneyRaised after removing the investor's contribution
    fundingRound.moneyRaised -= capTableInvestor.totalInvestment;
  
    // Save the updated funding round with the recalculated moneyRaised
    const updatedFundingRound = await this.fundingRoundRepository.save(fundingRound);
  
    // Manually set the updated cap table investors into the updatedFundingRound for return (excluding the removed investor)
    updatedFundingRound.capTableInvestors = fundingRound.capTableInvestors.filter(
      (investor) => investor.id !== capTableInvestor.id
    );
  
    return updatedFundingRound;
  }
  

  async getTotalMoneyRaisedForStartup(startupId: number): Promise<number> {
    try {
      // Find all funding rounds for the specified startup that are not deleted
      const fundingRounds = await this.fundingRoundRepository.find({
        where: { startup: { id: startupId }, isDeleted: false },
      });

      // Initialize a variable to hold the total money raised
      let totalMoneyRaised = 0;

      // Iterate through each funding round and sum up the money raised
      fundingRounds.forEach((round) => {
        // Ensure that moneyRaised is treated as a number
        totalMoneyRaised += round.moneyRaised;
      });

      return totalMoneyRaised;
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error('Error calculating total money raised:', error);
      throw error;
    }
  }

  async getTotalSharesForInvestor(investorId: number, companyId: number): Promise<number> {
    try {
      // Find all funding rounds where the specified investor has participated
      const capTableInvestors = await this.capTableInvestorRepository.find({
        where: {
          investor: { id: investorId },
          capTable: { startup: { id: companyId } }
        },
        relations: ['capTable', 'capTable.startup'],
      });

      // Initialize a variable to hold the total shares
      let totalShares = 0;

      // Iterate through each cap table investor entry and sum up the shares
      capTableInvestors.forEach((capTableInvestor) => {
        totalShares += capTableInvestor.totalInvestment;
      });

      return totalShares;
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error('Error calculating total shares for investor:', error);
      throw error;
    }
  }
  async getAllInvestorsDataOfAllTheCompany(companyId: number): Promise<InvestorData[]> {
    try {
      const totalMoneyRaised = await this.getTotalMoneyRaisedForStartup(companyId);
  
      const capTableInvestors = await this.capTableInvestorRepository.find({
        where: {
          capTable: { startup: { id: companyId } },
          isDeleted: false,
        },
        relations: ['investor', 'capTable', 'capTable.startup'],
      });
  
      const investorDataMap = new Map<number, InvestorData>();
  
      capTableInvestors.forEach((capTableInvestor) => {
        const { id, firstName, lastName } = capTableInvestor.investor;
        const investorName = `${firstName} ${lastName}`;
        const { title, shares, capTable } = capTableInvestor;
        const minimumShare = capTable.minimumShare; // Get the minimum share from the funding round
        const totalInvestment = shares * minimumShare;
  
        if (investorDataMap.has(id)) {
          const existingData = investorDataMap.get(id);
          existingData.shares += shares
          existingData.totalShares += totalInvestment;
          existingData.totalInvestment += totalInvestment;
          existingData.percentage = totalMoneyRaised ? (existingData.totalInvestment / totalMoneyRaised) * 100 : 0;
        } else {
          investorDataMap.set(id, {
            id,
            name: investorName,
            title,
            shares,
            totalShares: totalInvestment,
            totalInvestment: totalInvestment, // Store the totalInvestment
            percentage: totalMoneyRaised ? (totalInvestment / totalMoneyRaised) * 100 : 0,
          });
        }
      });
  
      return Array.from(investorDataMap.values());
    } catch (error) {
      this.logger.error('Error fetching all investor data:', error.message);
      throw new InternalServerErrorException('Error fetching all investor data');
    }
  }  
  
  

  async getAllInvestorDataByEachCompany(companyId: number): Promise<InvestorData[]> {
    try {
      const totalMoneyRaised = await this.getTotalMoneyRaisedForStartup(companyId);
  
      const capTableInvestors = await this.capTableInvestorRepository.find({
        where: {
          capTable: { startup: { id: companyId } },
          isDeleted: false,
        },
        relations: ['investor', 'capTable', 'capTable.startup'],
      });
  
      const investorDataMap: Map<number, InvestorData> = new Map();
  
      capTableInvestors.forEach((capTableInvestor) => {
        const investorId = capTableInvestor.investor.id;
        const investorName = `${capTableInvestor.investor.firstName} ${capTableInvestor.investor.lastName}`;
        const investorTitle = capTableInvestor.title;
        const shares = capTableInvestor.shares;
        const minimumShare = capTableInvestor.capTable.minimumShare; // Get the minimum share
        const totalInvestment = shares * minimumShare;
  
        if (investorDataMap.has(investorId)) {
          const existingData = investorDataMap.get(investorId);
          existingData.shares = shares;
          existingData.totalShares += totalInvestment;
          existingData.totalInvestment += totalInvestment; // Update totalInvestment
          existingData.percentage = totalMoneyRaised !== 0 ? (existingData.totalInvestment / totalMoneyRaised) * 100 : 0;
        } else {
          // const percentage = totalMoneyRaised !== 0 ? (shares / totalMoneyRaised) * 100 : 0;
          investorDataMap.set(investorId, {
            id: investorId,
            name: investorName,
            title: investorTitle,
            shares,
            totalShares: totalInvestment,
            totalInvestment: totalInvestment, // Set totalInvestment
            percentage: totalMoneyRaised ? (totalInvestment / totalMoneyRaised) * 100 : 0,
          });
        }
      });
  
      return Array.from(investorDataMap.values());
    } catch (error) {
      this.logger.error('Error fetching all investor data:', error);
      throw new InternalServerErrorException('Error fetching all investor data');
    }
  }  
  
  
  
  


}

