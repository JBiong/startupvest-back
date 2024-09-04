import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilePictureController } from 'src/controller/profilepicturecontroller/profilepicture.controller';
import { ProfilePicture } from 'src/entities/profilepictureentities/profilepicture.entity';
import { ProfilePictureService } from 'src/service/profilepictureservice/profilepicture.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfilePicture])],
  controllers: [ProfilePictureController],
  providers: [ProfilePictureService],
  exports: [ProfilePictureService], // export UserService so other modules can use it
})
export class ProfilePictureModule {}
