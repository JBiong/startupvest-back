import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartupService } from '../../service/businessprofileservice/startup.service';
// import { StartupsController } from '../controller/startup.controller';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { UsersModule } from '../user.module';
import { StartupsController } from 'src/controller/businessprofilecontroller/startup.controller';
// import { UserService } from 'src/service/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Startup]), UsersModule],
  controllers: [StartupsController],
  providers: [StartupService],
})
export class StartupModule {}
