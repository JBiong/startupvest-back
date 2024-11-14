import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Startup, StartupStatus } from "src/entities/businessprofileentities/startup.entity";
import { FundingRound } from "src/entities/financialentities/funding.entity";
import { Repository } from "typeorm";

@Injectable()
export class StartupService {
  constructor(
    @InjectRepository(Startup)
    private startupsRepository: Repository<Startup>,
    @InjectRepository(FundingRound)
    private fundingRoundRepository: Repository<FundingRound>
  ) {}

  // async create(startupData: Startup): Promise<Startup> {
  //   const startup = this.startupsRepository.create(startupData);
  //   return this.startupsRepository.save(startup);
  // }

  // In StartupService
  async findAllStarupsforguest(): Promise<Startup[]> {
    return this.startupsRepository.find();
  }

  // async findAll(userId: number): Promise<Startup[]> {
  //   return this.startupsRepository.find({ where: { user: { id: userId } } });
  // }

  async findOne(id: number): Promise<Startup> {
    return this.startupsRepository.findOne({ where: { id }, relations: ['ceo','cfo'] });
  }

  async create(userId: number, startupData: Startup): Promise<Startup> {
    const startup = this.startupsRepository.create({ ...startupData, ceo: { id: userId }, status: StartupStatus.PENDING, });
    return this.startupsRepository.save(startup);
  }

  async approveStartup(id: number): Promise<Startup> {
    const startup = await this.findOne(id);
    startup.status = StartupStatus.APPROVED;
    return this.startupsRepository.save(startup);
  }

  // Method to reject a startup
  async rejectStartup(id: number): Promise<Startup> {
    const startup = await this.findOne(id);
    startup.status = StartupStatus.REJECTED;
    return this.startupsRepository.save(startup);
  }

  async cancelStartup(id: number): Promise<Startup> {
    const startup = await this.findOne(id);
    startup.status = StartupStatus.CANCELLED;
    return this.startupsRepository.save(startup);
  }


  async requestDeletion(id: number): Promise<Startup> {
    const startup = await this.startupsRepository.findOne({ where: { id } });
    if (!startup) {
      throw new Error("Startup not found");
    }

    startup.deleteRequested = true;
    startup.deleteRequestedAt = new Date();
    return this.startupsRepository.save(startup);
  }

  async approveDeletion(id: number): Promise<Startup> {
    const startup = await this.startupsRepository.findOne({ where: { id } });
    if (!startup) {
      throw new Error("Startup not found");
    }

    await this.fundingRoundRepository.update( 
      {startup:{id}},
      {isDeleted: true});

    startup.isDeleted = true;
    startup.deleteRequested = false; // Reset the delete request status
    return this.startupsRepository.save(startup);
  }

  async rejectDeletion(id: number): Promise<Startup> {
    const startup = await this.startupsRepository.findOne({ where: { id } });
    if (!startup) {
      throw new Error("Startup not found");
    }

    startup.deleteRequested = false;
    return this.startupsRepository.save(startup);
  }

  async findAllDeletionRequests(): Promise<Startup[]> {
    return this.startupsRepository.find({
      where: { deleteRequested: true },
      relations: ['ceo', 'cfo'] // Fetch related entities if needed
    });
  }

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
        "ceo",
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

    await this.fundingRoundRepository.update( 
      {startup:{id}},
      {isDeleted: true});
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
