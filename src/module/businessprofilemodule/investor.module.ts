import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestorService } from 'src/service/businessprofileservice/investor.service';
// import { InvestorsController } from 'src/controller/investor.controller';
import { Investor } from '../../entities/businessprofileentities/investor.entity';
// import { UserService } from 'src/service/user.service';
import { UsersModule } from '../user.module';
import { InvestorsController } from 'src/controller/businessprofilecontroller/investor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Investor]), UsersModule],
  controllers: [InvestorsController],
  providers: [InvestorService],
})
export class InvestorModule {}
