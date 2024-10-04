import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartupService } from '../../service/businessprofileservice/startup.service';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { FundingRound } from 'src/entities/financialentities/funding.entity';
import { UsersModule } from '../user.module';
import { StartupsController } from 'src/controller/businessprofilecontroller/startup.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Startup, FundingRound]),
    UsersModule
  ],
  controllers: [StartupsController],
  providers: [StartupService],
  exports: [StartupService], // Export if needed by other modules
})
export class StartupModule {}