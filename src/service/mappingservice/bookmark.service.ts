import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bookmark } from "src/entities/mappingentities/bookmark.entity";
import { Repository } from "typeorm";
import { InvestorService } from "../businessprofileservice/investor.service";
import { StartupService } from "../businessprofileservice/startup.service";

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    private readonly startupService: StartupService,
    private readonly investorService: InvestorService
  ) {}

  async findAll(): Promise<Bookmark[]> {
    return await this.bookmarkRepository.find();
  }

  async findAllByUserId(userId: number): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "startup", "investor"],
    });
  }

  async create(bookmark: Partial<Bookmark>): Promise<void> {
    if (bookmark.startup?.id) {
      await this.startupService.incrementBookmark(bookmark.startup.id);
      await this.bookmarkRepository.insert({
        startup: { id: bookmark.startup.id },
        user: { id: bookmark.user.id },
      });
    } else if (bookmark.investor?.id) {
      await this.investorService.incrementBookmark(bookmark.investor.id);
      await this.bookmarkRepository.insert({
        investor: { id: bookmark.investor.id },
        user: { id: bookmark.user.id },
      });
    }
  }

  async startupRemove(userId: number, startupId: number): Promise<void> {
    await this.startupService.decrementBookmark(startupId);
    await this.bookmarkRepository.delete({ user: { id: userId }, startup: { id: startupId } });
  }

  async investorRemove(userId: number, investorId: number): Promise<void> {
    await this.investorService.decrementBookmark(investorId);
    await this.bookmarkRepository.delete({ user: { id: userId }, investor: { id: investorId } });
  }

  async findOneByUserIdandStartupId(userId: number, startupId: number): Promise<Bookmark | null> {
    return this.bookmarkRepository.findOne({
      where: { user: { id: userId }, startup: { id: startupId } },
    });
  }

  async findOneByUserIdandInvestorId(userId: number, investorId: number): Promise<Bookmark | null> {
    return this.bookmarkRepository.findOne({
      where: { user: { id: userId }, investor: { id: investorId } },
    });
  }

  async findAllByStartupId(startupId: number): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({ where: { startup: { id: startupId } } });
  }

  async findAllByInvestorId(investorId: number): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({ where: { investor: { id: investorId } } });
  }
}
