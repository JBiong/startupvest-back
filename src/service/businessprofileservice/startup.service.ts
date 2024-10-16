import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Startup } from "src/entities/businessprofileentities/startup.entity";
import { Repository } from "typeorm";

@Injectable()
export class StartupService {
  constructor(
    @InjectRepository(Startup)
    private startupsRepository: Repository<Startup>
  ) {}

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
    return this.startupsRepository.findOne({ where: { id }, relations: ['ceo','cfo'] });
  }

  async create(userId: number, startupData: Startup): Promise<Startup> {
    const startup = this.startupsRepository.create({ ...startupData, ceo: { id: userId } });
    return this.startupsRepository.save(startup);
  }

  // async findAllStartups(): Promise<Startup[]> {
  //   return this.startupsRepository.find({ where: { isDeleted: false } });
  // }

  async findOneWithFundingRounds(id: number): Promise<Startup> {
    return this.startupsRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        "fundingRounds",
        "fundingRounds.capTableInvestors",
        "fundingRounds.capTableInvestors.investor",
      ],
    });
  }

  async findAllStartupsWithFundingRounds(): Promise<Startup[]> {
    return this.startupsRepository.find({
      where: { isDeleted: false },
      relations: [
        "fundingRounds",
        "fundingRounds.capTableInvestors",
        "fundingRounds.capTableInvestors.investor",
      ],
    });
  }

  async findAll(userId: number): Promise<Startup[]> {
    return this.startupsRepository.find({ where: { ceo: { id: userId }, isDeleted: false } });
  }

  async update(id: number, startupData: Partial<Startup>): Promise<Startup> {
    const existingStartup = await this.findOne(id);
    if (!existingStartup) {
      throw new NotFoundException("Startup not found");
    }
    const updatedStartup = await this.startupsRepository.save({
      ...existingStartup,
      ...startupData,
    });
    return updatedStartup;
  }

  async softDelete(id: number): Promise<void> {
    const existingStartup = await this.findOne(id);
    if (!existingStartup) {
      throw new NotFoundException("Startup not found");
    }
    await this.startupsRepository.update(id, { isDeleted: true });
  }

  //for likes,bookmarks, views
  async incrementLike(id: number): Promise<void> {
    await this.startupsRepository.increment({ id }, "likes", 1);
  }

  async decrementLike(id: number): Promise<void> {
    await this.startupsRepository.decrement({ id }, "likes", 1);
  }

  async incrementBookmark(id: number): Promise<void> {
    await this.startupsRepository.increment({ id }, "bookmarks", 1);
  }

  async decrementBookmark(id: number): Promise<void> {
    await this.startupsRepository.decrement({ id }, "bookmarks", 1);
  }

  async incrementView(id: number): Promise<void> {
    await this.startupsRepository.increment({ id }, "views", 1);
  }

  // other methods...
}
