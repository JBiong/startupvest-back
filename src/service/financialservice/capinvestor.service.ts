import { Injectable } from '@nestjs/common';
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
  async findOne(id: number): Promise<CapTableInvestor> {
    return this.capTableInvestorRepository.findOne({ where: { id } });
  }

  // You can add more methods here for fetching shares, titles, etc.
}
