import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { UsersController } from './users.controller';
// import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { UsersController } from 'src/controller/user.controller';
import { UserService } from '../service/user.service';
import { MailService } from 'src/service/mailer.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({
    secret: process.env.JWT_SECRET,
  }),],
  controllers: [UsersController],
  providers: [UserService, MailService, JwtService],
  exports: [UserService], // export UserService so other modules can use it
})
export class UsersModule {}
