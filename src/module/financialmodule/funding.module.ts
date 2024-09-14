import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundingRoundService } from 'src/service/financialservice/funding.service';
import { FundingRound } from 'src/entities/financialentities/funding.entity';
import { StartupService } from 'src/service/businessprofileservice/startup.service'; // Import the StartupService
import { FundingRoundController } from 'src/controller/financialcontroller/funding.controller';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';
import { UserService } from 'src/service/user.service';
import { User } from 'src/entities/user.entity';
import { InvestorService } from 'src/service/businessprofileservice/investor.service';

import { CapTableInvestor } from 'src/entities/financialentities/capInvestor.entity';
import { CapTableInvestorController } from 'src/controller/financialcontroller/capinvestor.controller';
import { CapTableInvestorService } from 'src/service/financialservice/capinvestor.service';
import { ActivityService } from 'src/service/activityservice/activity.service';
import { Activity } from 'src/entities/activityentities/activity.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([FundingRound, Investor, Startup, User, CapTableInvestor,Activity]), // Import the Startup entity
  ],
  controllers: [FundingRoundController, CapTableInvestorController],
  providers: [FundingRoundService, StartupService, UserService, InvestorService, CapTableInvestorService,ActivityService], // Add StartupService to providers
})
export class FundingModule { }
