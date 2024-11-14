import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViewController } from "src/controller/mappingcontroller/view.controller";
import { Investor } from "src/entities/businessprofileentities/investor.entity";
import { Startup } from "src/entities/businessprofileentities/startup.entity";
import { View } from "src/entities/mappingentities/view.entity";
import { InvestorService } from "src/service/businessprofileservice/investor.service";
import { StartupService } from "src/service/businessprofileservice/startup.service";
import { ViewService } from "src/service/mappingservice/view.service";
import { InvestorModule } from "../businessprofilemodule/investor.module";
import { StartupModule } from "../businessprofilemodule/startup.module";
import { FundingRound } from "src/entities/financialentities/funding.entity";

@Module({
  imports: [TypeOrmModule.forFeature([View, Investor, Startup,FundingRound]), InvestorModule, StartupModule],
  controllers: [ViewController],
  providers: [ViewService, InvestorService, StartupService],
})
export class ViewModule {}
