import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapTableInvestor } from 'src/entities/financialentities/capInvestor.entity';

@Injectable()
export class CapTableInvestorService {
  constructor(
    @InjectRepository(CapTableInvestor)
    private readonly capTableInvestorRepository: Repository<CapTableInvestor>,
  ) { }

  async getInvestorInformation(capTableId: number): Promise<CapTableInvestor[]> {
    return this.capTableInvestorRepository.find({
      where: { capTable: { id: capTableId } },
    });
  }

  async findAll(userId: number): Promise<CapTableInvestor[]> {
    return this.capTableInvestorRepository.find({ where: { user: { id: userId }} });
  }

  async findOne(id: number): Promise<CapTableInvestor> {
    return this.capTableInvestorRepository.findOne({ where: { id } });
  }

  async findTopInvestorByUser(userId: number): Promise<{ topInvestorName: string, totalInvestment: number } | null> {
    const topInvestor = await this.capTableInvestorRepository.findOne({
        where: { user: { id: userId } },
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
