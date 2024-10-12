import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapTableInvestor } from 'src/entities/financialentities/capInvestor.entity';
import { FundingRound } from 'src/entities/financialentities/funding.entity';

@Injectable()
export class CapTableInvestorService {
  constructor(
    @InjectRepository(CapTableInvestor)
    private readonly capTableInvestorRepository: Repository<CapTableInvestor>,
    @InjectRepository(FundingRound)
    private readonly fundingRoundRepository: Repository<FundingRound>
  ) { }

  async getInvestorInformation(capTableId: number): Promise<CapTableInvestor[]> {
    return this.capTableInvestorRepository.find({
      where: { capTable: { id: capTableId } },
    });
  }

  async findAll(userId: number): Promise<CapTableInvestor[]> {
    return this.capTableInvestorRepository.find({ where: { user: { id: userId }, isDeleted: false, investorRemoved: false } });
  }

  async findAllInvestors(userId:number): Promise<any[]> {
    try {
        const investors = await this.capTableInvestorRepository.find({
            where: {
                isDeleted: false,
                investorRemoved: false,
                status: 'pending',
                capTable: {
                  startup: {
                    user: { id: userId }, // Filter by the user ID
                  },
              },
            },
            relations: [
                'investor',
                'capTable', 
                'capTable.startup',
                'user',
                'investor.user'
                 // This will fetch the startup directly
            ],
        });

        return investors.map(investor => ({
          capTableInvestorId: investor.id,
            investorId: investor.investor.id,
            investorName: investor.investor.firstName,
            capTableId: investor.capTable.id,
            fundingRoundId: investor.capTable.id, // If the funding round ID is supposed to come from capTable
            startupId: investor.capTable.startup.id, // Fetching startup ID
            startupName: investor.capTable.startup.companyName, // Fetching startup name
            status: investor.status,
            shares: investor.shares,
            email: investor.investor.emailAddress,
            title: investor.title,
            fundName: investor.capTable.fundingName,
            createdAt: investor.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching cap table investors:', error);
        throw new Error('Unable to fetch cap table investors');
    }
}

async findAllInvestorRequests(investorId: number): Promise<any[]> {
  try {
      // Fetch requests specific to the given investorId
      const requests = await this.capTableInvestorRepository.find({
          where: {
              isDeleted: false,
              investorRemoved: false,
              investor: {
                  id: investorId // Filter by investor ID
              },
          },
          relations: [
              'capTable', // Include funding round details
              'capTable.startup', // Include startup details if necessary
              'investor' // Include investor details
          ],
      });

      // Map over the requests to format the response
      return requests.map(request => ({
          capTableInvestorId: request.id,
          investorId: request.investor.id, // Get investor ID
          investorName: request.investor.firstName, // Ensure you have a name field in your Investor entity
          capTableId: request.capTable.id,
          startupId: request.capTable.startup.id,
          startupName: request.capTable.startup.companyName, // Ensure there's a companyName field in your Startup entity
          status: request.status,
          shares: request.shares,
          title: request.title,
          totalinvestment: request.totalInvestment,
          createdAt: request.createdAt,
          currency: request.capTable.moneyRaisedCurrency,
      }));
  } catch (error) {
      console.error('Error fetching investor requests:', error);
      throw new Error('Unable to fetch investor requests');
  }
}






  async findOne(id: number): Promise<CapTableInvestor> {
    return this.capTableInvestorRepository.findOne({ where: { id } });
  }

  async findTopInvestorByUser(userId: number): Promise<{ topInvestorName: string, totalInvestment: number } | null> {
    const topInvestor = await this.capTableInvestorRepository.findOne({
        where: { user: { id: userId }, isDeleted: false, investorRemoved: false },
        relations: ['investor'], // Ensure 'investor' relation is fetched
        order: { totalInvestment: 'DESC' }, // Sort by totalInvestment descending
    });

    if (!topInvestor) {
        return null; // No investors found
    }

    // Return the top investor's name and totalInvestment
    return {
        topInvestorName: `${topInvestor.investor.firstName} ${topInvestor.investor.lastName}`, // Assuming 'name' is a property of the investor entity
        totalInvestment: topInvestor.totalInvestment,
    };
}



  async removeInvestor(investorId: number, capTableId: number): Promise<void> {
    const capTableInvestor = await this.capTableInvestorRepository.findOne({
      where: { investor: { id: investorId }, capTable: { id: capTableId } },
    });

    if (!capTableInvestor) {
      throw new NotFoundException('CapTableInvestor not found');
    }

    capTableInvestor.investorRemoved = true;
    await this.capTableInvestorRepository.save(capTableInvestor);
  }

  // You can add more methods here for fetching shares, titles, etc.
}
