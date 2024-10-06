import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { UsersController } from './users.controller';
// import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { UsersController } from 'src/controller/user.controller';
import { UserService } from '../service/user.service';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Startup])],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService], // export UserService so other modules can use it
})
export class UsersModule {}
