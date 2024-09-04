import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken

@Injectable()
export class StartupService {
  constructor(
    @InjectRepository(Startup)
    private startupsRepository: Repository<Startup>,
  ) { }

  // async create(startupData: Startup): Promise<Startup> {
  //   const startup = this.startupsRepository.create(startupData);
  //   return this.startupsRepository.save(startup);
  // }

  // In StartupService
  // async findAll(): Promise<Startup[]> {
  //   return this.startupsRepository.find();
  // }

  // async findAll(userId: number): Promise<Startup[]> {
  //   return this.startupsRepository.find({ where: { user: { id: userId } } });
  // }

  async findOne(id: number): Promise<Startup> {
    return this.startupsRepository.findOne({ where: { id } });
  }

  async create(userId: number, startupData: Startup): Promise<Startup> {
    const startup = this.startupsRepository.create({ ...startupData, user: { id: userId } });
    return this.startupsRepository.save(startup);
  }

  async findAllStartups(): Promise<Startup[]> {
    return this.startupsRepository.find({ where: { isDeleted: false } });
  }

  async findAll(userId: number): Promise<Startup[]> {
    return this.startupsRepository.find({ where: { user: { id: userId }, isDeleted: false } });
  }

  async update(id: number, startupData: Partial<Startup>): Promise<Startup> {
    const existingStartup = await this.findOne(id);
    if (!existingStartup) {
      throw new NotFoundException('Startup not found');
    }
    const updatedStartup = await this.startupsRepository.save({ ...existingStartup, ...startupData });
    return updatedStartup;
  }

  async softDelete(id: number): Promise<void> {
    const existingStartup = await this.findOne(id);
    if (!existingStartup) {
      throw new NotFoundException('Startup not found');
    }
    await this.startupsRepository.update(id, { isDeleted: true });
  }

  // other methods...
}