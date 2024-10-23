import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { In } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class InvestorService {
  [x: string]: any;
  constructor(
    @InjectRepository(Investor)
    private investorsRepository: Repository<Investor>,
  ) { }

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

  async create(userId: number, user: User): Promise<Investor> {
    const investor = this.investorsRepository.create({
      id: userId, // Set the investor ID from the user ID
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.email,
      contactInformation: user.contactNumber,
      gender: user.gender,
      biography: user.biography || '',
      facebook: user.facebook || '',
      twitter: user.twitter || '',
      instagram: user.instagram || '',
      linkedIn: user.linkedIn || '',
      user: { id: userId }, // Link the user
    });

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

    //for likes,bookmarks, views
    async incrementLike(id: number): Promise<void> {
      await this.investorsRepository.increment({ id }, "likes", 1);
    }
  
    async decrementLike(id: number): Promise<void> {
      await this.investorsRepository.decrement({ id }, "likes", 1);
    }
  
    async incrementBookmark(id: number): Promise<void> {
      await this.investorsRepository.increment({ id }, "bookmarks", 1);
    }
  
    async decrementBookmark(id: number): Promise<void> {
      await this.investorsRepository.decrement({ id }, "bookmarks", 1);
    }
  
    async incrementView(id: number): Promise<void> {
      await this.investorsRepository.increment({ id }, "views", 1);
    }

  // other methods...
}