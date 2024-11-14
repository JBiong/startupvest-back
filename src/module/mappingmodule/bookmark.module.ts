import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookmarkController } from "src/controller/mappingcontroller/bookmark.controller";
import { Investor } from "src/entities/businessprofileentities/investor.entity";
import { Startup } from "src/entities/businessprofileentities/startup.entity";
import { Bookmark } from "src/entities/mappingentities/bookmark.entity";
import { InvestorService } from "src/service/businessprofileservice/investor.service";
import { StartupService } from "src/service/businessprofileservice/startup.service";
import { BookmarkService } from "src/service/mappingservice/bookmark.service";
import { InvestorModule } from "../businessprofilemodule/investor.module";
import { StartupModule } from "../businessprofilemodule/startup.module";
import { FundingRound } from "src/entities/financialentities/funding.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Investor, Startup,FundingRound]), StartupModule, InvestorModule],
  controllers: [BookmarkController],
  providers: [BookmarkService, InvestorService, StartupService],
})
export class BookmarkModule {}
