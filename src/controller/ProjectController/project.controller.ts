import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectDto } from 'src/dto/ProjectDto/create-project.dto';
import { UpdateProjectDto } from 'src/dto/ProjectDto/update-project.dto';
import { ProjectService } from 'src/service/ProjectService/project.service';
import * as jwt from "jsonwebtoken";

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  
  private getUserIdFromToken(authorizationHeader?: string): number {
    if (!authorizationHeader) {
      throw new UnauthorizedException("Authorization header is required");
    }
    const token = authorizationHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    return payload.userId;
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Post()
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    const userId = this.getUserIdFromToken(req.headers['authorization']);
    return this.projectService.create(userId, createProjectDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.projectService.findAllByCeo(+ceoId);
  }

  @Get('cfo/:cfoId')
  findAllByCfo(@Param('cfoId') cfoId: string) {
    return this.projectService.findAllByCfo(+cfoId);
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.projectService.findAllByStartup(+startupId);
  }
}
