import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from '../../controller/ProjectController/project.controller';
import { ProjectService } from 'src/service/ProjectService/project.service';
import { Project } from 'src/entities/ProjectEntity/project.entity';
import { ProjectUser } from 'src/entities/ProjectEntity/project-user.entity';
import { ProjectResource } from 'src/entities/ProjectEntity/project-resource.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      User,
      Startup,
      ProjectUser,
      ProjectResource,
    ]),
  ],
  providers: [ProjectService], // Register ProjectService
  controllers: [ProjectController], // Register ProjectController
  exports: [ProjectService, TypeOrmModule], // Export ProjectService and TypeOrmModule for use in other modules
})
export class ProjectModule {}
