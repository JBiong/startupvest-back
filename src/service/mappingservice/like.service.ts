import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like } from "src/entities/mappingentities/like.entity";
import { Repository } from "typeorm";
import { InvestorService } from "../businessprofileservice/investor.service";
import { StartupService } from "../businessprofileservice/startup.service";

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly startupService: StartupService,
    private readonly investorService: InvestorService
  ) {}

  async findAll(): Promise<Like[]> {
    return await this.likeRepository.find();
  }

  async create(like: Partial<Like>): Promise<void> {
    if (like.startup?.id) {
      await this.startupService.incrementLike(like.startup.id);
      await this.likeRepository.insert({
        startup: { id: like.startup.id },
        user: { id: like.user.id },
      });
    } else if (like.investor?.id) {
      await this.investorService.incrementLike(like.investor.id);
      await this.likeRepository.insert({
        investor: { id: like.investor.id },
        user: { id: like.user.id },
      });
    }
  }

  async startupRemove(userId: number, startupId: number): Promise<void> {
    await this.startupService.decrementLike(startupId);
    await this.likeRepository.delete({ user: { id: userId }, startup: { id: startupId } });
  }

  async investorRemove(userId: number, investorId: number): Promise<void> {
    await this.investorService.decrementLike(investorId);
    await this.likeRepository.delete({ user: { id: userId }, investor: { id: investorId } });
  }

  async findOneByUserIdandStartupId(userId: number, startupId: number): Promise<Like | null> {
    return this.likeRepository.findOne({
      where: { user: { id: userId }, startup: { id: startupId } },
    });
  }
  async findOneByUserIdandInvestorId(userId: number, investorId: number): Promise<Like | null> {
    return this.likeRepository.findOne({
      where: { user: { id: userId }, investor: { id: investorId } },
    });
  }

  async findAllByStartupId(startupId: number): Promise<Like[]> {
    return this.likeRepository.find({ where: { startup: { id: startupId } } });
  }

  async findAllByInvestorId(investorId: number): Promise<Like[]> {
    return this.likeRepository.find({ where: { investor: { id: investorId } } });
  }
}
