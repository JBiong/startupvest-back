import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FundingRound } from "src/entities/financialentities/funding.entity";
import { InvestorService } from "../businessprofileservice/investor.service";
import { CapTableInvestor } from "src/entities/financialentities/capInvestor.entity";
import { ActivityService } from "../activityservice/activity.service";
import { title } from "process";
import { Investor } from "src/entities/businessprofileentities/investor.entity";
import { share } from "rxjs";
import { User } from "src/entities/user.entity";

export interface InvestorData {
  id: number;
  name: string;
  title: string;
  shares: number;
  status: string;
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
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,
  ) { }

  async create(
    fundingId: number,
    fundingRoundData: FundingRound,
    investorIds: number[],
    investorShares: number[],
    investorTitles: string[],
    userId: number // Add userId parameter
  ): Promise<FundingRound> {
    console.log("Investor IDs:", investorIds);

    // Fetch investors by their IDs
    const investors = await this.investorService.findByIds(investorIds);
    console.log("Fetched Investors:", investors);

    const sortedInvestors = investorIds.map((id) => {
      return investors.find((investor) => investor.id === id);
    });

    // Use minimumShare from fundingRoundData (passed during the creation)
    const minimumShare = fundingRoundData.minimumShare;

    // Calculate moneyRaised from investorShares array
    const moneyRaised = investorShares.reduce(
      (acc, shares, index) => acc + minimumShare * shares,
      0
    );

    // Create the funding round entity
    const funding = this.fundingRoundRepository.create({
      ...fundingRoundData,
      startup: { id: fundingId },
      investors,
      moneyRaised, // Associate investors with the funding round
    });

    const createdCapTable = await this.fundingRoundRepository.save(funding);
    console.log("Created Cap Table:", createdCapTable);

    // Create and save CapTableInvestor entities
    const capTableInvestors = sortedInvestors.map((investor, index) => {
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
    await Promise.all(
      capTableInvestors.map(async (capTableInvestor) => {
        await this.capTableInvestorRepository.save(capTableInvestor);
        return this.findById(createdCapTable.id);
      })
    );

    return createdCapTable;
  }

  async findById(id: number): Promise<FundingRound> {
    console.log(`Attempting to find funding round with ID: ${id}`);

    try {
      const fundingRound = await this.fundingRoundRepository.findOne({
        where: { id, isDeleted: false },
        relations: [
          "startup",
          "capTableInvestors",
          "capTableInvestors.investor",
        ],
      });

      if (!fundingRound) {
        console.log(`Funding round with ID ${id} not found`);
        throw new NotFoundException("Funding round not found");
      }

      return fundingRound;
    } catch (error) {
      console.error("Error finding funding round by ID:", error);
      throw new NotFoundException("Funding round not found");
    }
  }

  async findAll(): Promise<FundingRound[]> {
    return this.fundingRoundRepository.find({
      where: { isDeleted: false,  },
      relations: ["startup", "capTableInvestors", "capTableInvestors.investor"],
    });
  }

  async update(
    id: number,
    updateData: Partial<FundingRound>,
    investorData: { id: number; shares: number; title: string; totalInvestment: number }[],
    userId: number // Add userId here
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
      existingCapTableInvestors.forEach(investor => {
          existingCapTableInvestorMap.set(investor.investor.id, investor);
      });

      const updatedCapTableInvestors: CapTableInvestor[] = [];

      // Set of investor IDs received in the update data
      const investorIdsInUpdate = new Set(investorData.map(data => data.id));

      // Deactivate investors not in the current update data
      for (const investor of existingCapTableInvestors) {
          if (!investorIdsInUpdate.has(investor.investor.id)) {
              // Mark the investor as removed (inactive) if not part of the new data
              investor.investorRemoved = true;
              updatedCapTableInvestors.push(investor);
          }
      }

      // Update existing investors and add new investors
      for (const { id: investorId, shares, title, totalInvestment } of investorData) {
          let capTableInvestor = existingCapTableInvestorMap.get(investorId);

          if (capTableInvestor) {
              // If investor exists, update their shares, title, and reactivate if needed
              capTableInvestor.shares = shares;
              capTableInvestor.title = title;
              capTableInvestor.totalInvestment = minimumShare * shares; // Ensure totalInvestment is correctly calculated
              capTableInvestor.investorRemoved = false; // Mark as active again if previously removed

              // Assign the userId to the existing cap table investor
              capTableInvestor.user = { id: userId } as User;
          } else {
              // Create new investor
              capTableInvestor = this.capTableInvestorRepository.create({
                  capTable: fundingRound, // Ensure capTable is set
                  investor: { id: investorId } as Investor,
                  shares: shares,
                  title: title,
                  totalInvestment: minimumShare * shares, // Calculate totalInvestment
                  user: { id: userId } as User,
                  investorRemoved: false // Mark new investors as active
              });
          }

          // Add to updated investors list
          updatedCapTableInvestors.push(capTableInvestor);
      }

      // Save all updated and new investors to the cap table
      await this.capTableInvestorRepository.save(updatedCapTableInvestors);

      // Recalculate the money raised
      fundingRound.moneyRaised = updatedCapTableInvestors
          .filter(investor => !investor.investorRemoved) // Only count active investors
          .reduce((acc, investor) => acc + investor.totalInvestment, 0);

      // Save the updated funding round
      const updatedFundingRound = await this.fundingRoundRepository.save(fundingRound);

      // Manually set the updated cap table investors into the updatedFundingRound for return
      updatedFundingRound.capTableInvestors = updatedCapTableInvestors;

      return updatedFundingRound;
  }
  
  
  async softDelete(id: number): Promise<void> {
    const fundingRound = await this.fundingRoundRepository.findOne({
      where: { id },
      relations: ["capTableInvestors"],
    });

    if (!fundingRound) {
      throw new NotFoundException("Funding round not found");
    }

    // Mark funding round as deleted
    fundingRound.isDeleted = true;

    // Mark all related cap table investors as deleted
    fundingRound.capTableInvestors.forEach((investor) => {
      investor.isDeleted = true;
    });

    // Soft delete the cap table investors
    await this.capTableInvestorRepository.save(fundingRound.capTableInvestors);

    // Save the updated funding round
    await this.fundingRoundRepository.save(fundingRound);
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
      console.error("Error calculating total money raised:", error);
      throw error;
    }
  }


  

  async getTotalSharesForInvestor(
    investorId: number,
    companyId: number
  ): Promise<number> {
    try {
      // Find all funding rounds where the specified investor has participated
      const capTableInvestors = await this.capTableInvestorRepository.find({
        where: {
          investor: { id: investorId },
          capTable: { startup: { id: companyId } },
        },
        relations: ["capTable", "capTable.startup"],
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
      console.error("Error calculating total shares for investor:", error);
      throw error;
    }
  }

  async getAllInvestorsDataOfAllTheCompany(companyId: number): Promise<{ investors: InvestorData[], fundingRounds: FundingRound[] }> {
    try {
      const fundingRounds = await this.fundingRoundRepository.find({
        where: { startup: { id: companyId }, isDeleted: false },
        relations: ['startup', 'capTableInvestors', 'capTableInvestors.investor'],
        order: { createdAt: 'DESC' }, // Order by creation date, most recent first
      });

      // if (!fundingRounds.length) {
      //   throw new InternalServerErrorException('No funding rounds found for the company');
      // }

      const investorDataMap = new Map<number, InvestorData>();
      let totalMoneyRaised = 0;

      fundingRounds.forEach((fundingRound) => {
        totalMoneyRaised += fundingRound.moneyRaised;

        fundingRound.capTableInvestors.forEach((capTableInvestor) => {
          if (capTableInvestor.investorRemoved || capTableInvestor.status !== 'accepted') return;

          const { id, firstName, lastName } = capTableInvestor.investor;
          const investorName = `${firstName} ${lastName}`;
          const { title, shares } = capTableInvestor;
          const minimumShare = fundingRound.minimumShare;
          const totalInvestment = shares * Number(minimumShare);

          if (investorDataMap.has(id)) {
            const existingData = investorDataMap.get(id);
            existingData.shares += shares;
            existingData.totalShares += totalInvestment;
            existingData.totalInvestment += totalInvestment;
          } else {
            investorDataMap.set(id, {
              id,
              name: investorName,
              title,
              shares,
              status: capTableInvestor.status,
              totalShares: totalInvestment,
              totalInvestment: totalInvestment,
              percentage: 0, // We'll calculate this after summing up all investments
            });
          }
        });
      });

      // Calculate percentages based on total money raised across all funding rounds
      investorDataMap.forEach((investor) => {
        investor.percentage = totalMoneyRaised > 0 ? (investor.totalInvestment / totalMoneyRaised) * 100 : 0;
      });

      const investors = Array.from(investorDataMap.values());

      // Remove sensitive information from funding rounds
      const sanitizedFundingRounds = fundingRounds.map(({ capTableInvestors, ...rest }) => rest);

      return {
        investors,
        fundingRounds: sanitizedFundingRounds as FundingRound[]
      };
    } catch (error) {
      this.logger.error("Error fetching all investor data:", error.message);
      throw new InternalServerErrorException(
        "Error fetching all investor data"
      );
    }
  }




  async getAllInvestorDataByEachCompany(
    companyId: number
  ): Promise<InvestorData[]> {
    try {
      const totalMoneyRaised =
        await this.getTotalMoneyRaisedForStartup(companyId);

      const capTableInvestors = await this.capTableInvestorRepository.find({
        where: {
          capTable: { startup: { id: companyId } },
          isDeleted: false,
        },
        relations: ["investor", "capTable", "capTable.startup"],
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
          existingData.percentage =
            totalMoneyRaised !== 0
              ? (existingData.totalInvestment / totalMoneyRaised) * 100
              : 0;
        } else {
          // const percentage = totalMoneyRaised !== 0 ? (shares / totalMoneyRaised) * 100 : 0;
          investorDataMap.set(investorId, {
            id: investorId,
            name: investorName,
            title: investorTitle,
            status: capTableInvestor.status,
            shares,
            totalShares: totalInvestment,
            totalInvestment: totalInvestment, // Set totalInvestment
            percentage: totalMoneyRaised
              ? (totalInvestment / totalMoneyRaised) * 100
              : 0,
          });
        }
      });

      return Array.from(investorDataMap.values());
    } catch (error) {
      this.logger.error("Error fetching all investor data:", error);
      throw new InternalServerErrorException(
        "Error fetching all investor data"
      );
    }
  }





  async getTotalMonthlyFunding(ceoId: number, year: number): Promise<any> {
    try {
      // Fetch companies associated with the user, filtered by year
      const userCompanies = await this.fundingRoundRepository
        .createQueryBuilder("fundingRound")
        .innerJoinAndSelect("fundingRound.startup", "startup")
        .innerJoinAndSelect("startup.ceo", "ceo")
        .where("ceo.id = :ceoId", { ceoId })
        .andWhere("YEAR(fundingRound.createdAt) = :year", { year })
        .andWhere("fundingRound.isDeleted = 0")
        .select(["fundingRound.createdAt", "fundingRound.moneyRaised"])
        .getMany();

      // Check if userCompanies is not empty
      if (!userCompanies.length) {
        throw new NotFoundException(
          "No funding rounds found for the specified user and year"
        );
      }

      const monthlyTotals = new Map<string, number>();

      userCompanies.forEach((round) => {
        const month = round.createdAt.toISOString().slice(0, 7); // 'YYYY-MM'
        if (!monthlyTotals.has(month)) {
          monthlyTotals.set(month, 0);
        }
        monthlyTotals.set(month, monthlyTotals.get(month) + round.moneyRaised);
      });

      return Array.from(monthlyTotals.entries()).map(([month, total]) => ({
        month,
        total,
      }));
    } catch (error) {
      this.logger.error(
        "Error calculating total monthly funding:",
        error.message
      );
      throw new InternalServerErrorException(
        "Error calculating total monthly funding"
      );
    }
  }

  async getTotalMonthlyFundingByCompany(
    companyId: number,
    year: number
  ): Promise<any> {
    try {
      // Fetch funding rounds associated with the specified company, filtered by year
      const companyFundingRounds = await this.fundingRoundRepository
        .createQueryBuilder("fundingRound")
        .innerJoinAndSelect("fundingRound.startup", "startup")
        .where("startup.id = :companyId", { companyId })
        .andWhere("YEAR(fundingRound.createdAt) = :year", { year })
        .andWhere("fundingRound.isDeleted = 0") // Filter by year
        .select(["fundingRound.createdAt", "fundingRound.moneyRaised"])
        .getMany();

      // Check if companyFundingRounds is not empty
      if (!companyFundingRounds.length) {
        throw new NotFoundException(
          "No funding rounds found for the specified company and year"
        );
      }

      const monthlyTotals = new Map<string, number>();

      // Aggregate the money raised by month
      companyFundingRounds.forEach((round) => {
        const month = round.createdAt.toISOString().slice(0, 7); // 'YYYY-MM'
        if (!monthlyTotals.has(month)) {
          monthlyTotals.set(month, 0);
        }
        monthlyTotals.set(month, monthlyTotals.get(month) + round.moneyRaised);
      });

      // Convert the map to an array of objects
      return Array.from(monthlyTotals.entries()).map(([month, total]) => ({
        month,
        total,
      }));
    } catch (error) {
      this.logger.error(
        "Error calculating total monthly funding by company:",
        error.message
      );
      throw new InternalServerErrorException(
        "Error calculating total monthly funding by company"
      );
    }
  }


  async createInvestment(
    fundingRoundId: number,
    investorId: number,
    shares: number,
  ): Promise<CapTableInvestor> {
    // Fetch the funding round and investor entities
    const fundingRound = await this.fundingRoundRepository.findOne({ where: { id: fundingRoundId } });
    const investor = await this.investorRepository.findOne({ where: { id: investorId } });
  
    if (!fundingRound || !investor) {
      throw new Error('Funding round or investor not found');
    }
  
    // Check if the investor has any 'pending' investment in the funding round
    const pendingInvestment = await this.capTableInvestorRepository.findOne({
      where: { capTable: { id: fundingRoundId }, investor: { id: investorId }, status: 'pending' },
    });
  
    // If a pending investment exists, throw an error to block further investment
    if (pendingInvestment) {
      throw new Error('You already have a pending investment in this funding round. Please wait until it is accepted before investing again.');
    }
  
    // If no previous pending investment exists, create a new CapTableInvestor entry with 'pending' status
    const newTotalInvestment = Number(shares) * fundingRound.minimumShare;
    const capTableInvestor = this.capTableInvestorRepository.create({
      capTable: fundingRound,
      investor: investor,
      title: " ", // Add any title if necessary
      shares: Number(shares), // Ensure the shares are treated as a number
      totalInvestment: newTotalInvestment,
      status: 'pending', // New investments start with a pending status
    });
  
    // Save the new investment to the database
    return await this.capTableInvestorRepository.save(capTableInvestor);
  }
  


  async updateInvestmentStatus(
    capTableInvestorId: number,
    newStatus: string,
    additionalShares?: number, // Optional parameter for additional shares when status is 'accepted'
  ): Promise<CapTableInvestor> {
    // Find the cap table investor entry (the one with pending status)
    const capTableInvestor = await this.capTableInvestorRepository.findOne({
      where: { id: capTableInvestorId },
      relations: ['capTable', 'investor'], // Ensure fundingRound (capTable) is also fetched
    });
  
    if (!capTableInvestor) {
      throw new Error('CapTableInvestor not found');
    }
  
    const fundingRound = capTableInvestor.capTable;
  
    // Handle accepted status
    if (newStatus === 'accepted') {
      // Check for an existing accepted investment for this investor in the same funding round
      const existingAcceptedInvestment = await this.capTableInvestorRepository.findOne({
        where: {
          capTable: { id: fundingRound.id },
          investor: { id: capTableInvestor.investor.id },
          status: 'accepted',
          investorRemoved: false, // Only find accepted investments where the investor is not removed
        },
      });
  
      if (existingAcceptedInvestment) {
        // Combine shares with the existing accepted investment
        existingAcceptedInvestment.shares = Number(existingAcceptedInvestment.shares) + Number(capTableInvestor.shares);
  
        // Recalculate the total investment
        existingAcceptedInvestment.totalInvestment = existingAcceptedInvestment.shares * fundingRound.minimumShare;
  
        // Update the moneyRaised for the funding round
        fundingRound.moneyRaised += capTableInvestor.totalInvestment;
  
        // Save the updated accepted investment and the funding round
        await this.capTableInvestorRepository.save(existingAcceptedInvestment);
        await this.fundingRoundRepository.save(fundingRound);
  
        // Remove the pending investment (since its shares are merged)
        await this.capTableInvestorRepository.remove(capTableInvestor);
  
        // Return the merged accepted investment
        return existingAcceptedInvestment;
      }
  
      // If no existing accepted investment, create a new one
      capTableInvestor.status = 'accepted';
      fundingRound.moneyRaised += capTableInvestor.totalInvestment; // Update moneyRaised for the funding round
      await this.fundingRoundRepository.save(fundingRound);
      return await this.capTableInvestorRepository.save(capTableInvestor); // Save the new investment entry
    }
  
    // Handle rejection
    if (newStatus === 'rejected') {
      capTableInvestor.status = 'rejected';
      console.log(`Investment ${capTableInvestorId} rejected, ignoring previous investments.`);
    }
  
    // Save the updated investment (whether accepted or rejected)
    return await this.capTableInvestorRepository.save(capTableInvestor);
  }
  
  
  
  

  // async getTotalFundedPerMonth(): Promise<{ month: string, totalAmount: number }[]> {
  //   try {
  //     return await this.fundingRoundRepository
  //       .createQueryBuilder('fundingRound')
  //       .select("DATE_FORMAT(fundingRound.createdAt, '%Y-%m')", 'month') // Format date for MySQL
  //       .addSelect('SUM(fundingRound.moneyRaised)', 'totalAmount') // Sum of the funding amounts
  //       .groupBy('month')
  //       .orderBy('month', 'ASC') // Order the months in ascending order
  //       .getRawMany(); // Fetch raw results
  //   } catch (error) {
  //     this.logger.error('Error fetching total funded amount per month', error.message);
  //     throw new InternalServerErrorException('Error fetching total funded amount per month');
  //   }
  // }
  
}

