import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LikeController } from "src/controller/mappingcontroller/like.controller";
import { Investor } from "src/entities/businessprofileentities/investor.entity";
import { Startup } from "src/entities/businessprofileentities/startup.entity";
import { Like } from "src/entities/mappingentities/like.entity";
import { InvestorService } from "src/service/businessprofileservice/investor.service";
import { StartupService } from "src/service/businessprofileservice/startup.service";
import { LikeService } from "src/service/mappingservice/like.service";
import { InvestorModule } from "../businessprofilemodule/investor.module";
import { StartupModule } from "../businessprofilemodule/startup.module";
import { FundingRound } from "src/entities/financialentities/funding.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Like, Startup, Investor,FundingRound]), StartupModule, InvestorModule],
  controllers: [LikeController],
  providers: [LikeService, StartupService, InvestorService],
})
export class LikeModule {}
