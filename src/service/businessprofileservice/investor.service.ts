import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { In } from 'typeorm';

@Injectable()
export class InvestorService {
  [x: string]: any;
  constructor(
    @InjectRepository(Investor)
    private investorsRepository: Repository<Investor>,
  ) { }

  // async create(investorData: Investor): Promise<Investor> {
  //   const investor = this.investorsRepository.create(investorData);
  //   return this.investorsRepository.save(investor);
  // }

  // // In InvestorService
  // async findAll(): Promise<Investor[]> {
  //   return this.investorsRepository.find();
  // }

  // async findAll(userId: number): Promise<Investor[]> {
  //   return this.investorsRepository.find({ where: { user: { id: userId } } });
  // }
  async findByIds(ids: number[]): Promise<Investor[]> {
    console.log('findByIds received ids:', ids);
    if (ids.length === 0) {
      return [];
    }
    const investors = await this.investorsRepository.find({ where: { id: In(ids) } });
    console.log('Fetched investors from DB:', investors);
    return investors;
  }

  async findOne(id: number): Promise<Investor> {
    return this.investorsRepository.findOne({ where: { id } });
  }

  async create(userId: number, investorData: Investor): Promise<Investor> {
    const investor = this.investorsRepository.create({ ...investorData, user: { id: userId } });
    return this.investorsRepository.save(investor);
  }

  async findAllCreatedUser(userId: number): Promise<Investor[]> {
    return this.investorsRepository.find({ where: { user: { id: userId } } });
  }
  async findAllInvestors(): Promise<Investor[]> {
    return this.investorsRepository.find();
  }

  // async getInvestorIds(userId: number): Promise<number[]> {
  //   const investors = await this.findAll(userId);
  //   const ids = investors.map(investor => investor.id);
  //   console.log(ids);
  //   return ids;
  // }



  async update(id: number, investorData: Partial<Investor>): Promise<Investor> {
    const existingInvestor = await this.findOne(id);
    if (!existingInvestor) {
      throw new NotFoundException('Investor not found');
    }
    const updatedInvestor = await this.investorsRepository.save({ ...existingInvestor, ...investorData });
    return updatedInvestor;
  }

  async softDelete(id: number): Promise<void> {
    const existingInvestor = await this.findOne(id);
    if (!existingInvestor) {
        throw new NotFoundException('Investor not found');
    }
    await this.investorsRepository.update(id, { isDeleted: true });
  }

  // other methods...
}