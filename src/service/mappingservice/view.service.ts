import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { View } from "src/entities/mappingentities/view.entity";
import { Repository } from "typeorm";
import { StartupService } from "../businessprofileservice/startup.service";
import { InvestorService } from "../businessprofileservice/investor.service";

@Injectable()
export class ViewService {
	constructor(
		@InjectRepository(View)
		private readonly viewRepository: Repository<View>,
		private readonly startupService: StartupService,
        private readonly investorService: InvestorService
	) {}

	async create(view: Partial<View>): Promise<void> {
		if (view.startup?.id) {
            await this.startupService.incrementView(view.startup.id);
            await this.viewRepository.insert({
              startup: { id: view.startup.id },
              user_id: view.user_id
            });
          } else if (view.investor?.id) {
            await this.investorService.incrementView(view.investor.id);
            await this.viewRepository.insert({
              investor: { id: view.investor.id },
              user_id: view.user_id
            });
          }
	}

    async findRecentsByUserId(userId: number): Promise<View[]> {
		return this.viewRepository.find({
			where: { user_id: userId },
			order: { timestamp: "DESC" },
			take: 20,
			relations: ["startup", "investor"],
		});
	}
    
	async findAllByStartupId(startupId: number): Promise<View[]> {
		return this.viewRepository.find({ where: { startup: { id: startupId } } });
	}

	async findAllByInvestorId(investorId: number): Promise<View[]> {
		return this.viewRepository.find({ where: { investor: { id: investorId } } });
	}

	async findAll(): Promise<View[]> {
		return this.viewRepository.find();
	}
}
