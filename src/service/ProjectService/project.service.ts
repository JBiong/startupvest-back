import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProjectDto } from 'src/dto/ProjectDto/create-project.dto';
import { UpdateProjectDto } from 'src/dto/ProjectDto/update-project.dto';
import { Project } from 'src/entities/ProjectEntity/project.entity';
import { ProjectUser } from 'src/entities/ProjectEntity/project-user.entity';
import { ProjectResource } from 'src/entities/ProjectEntity/project-resource.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';


@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Startup) private startupRepository: Repository<Startup>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
    @InjectRepository(ProjectResource)
    private projectResourceRepository: Repository<ProjectResource>,
  ) {}

  async findAll() {
    return this.projectRepository.find();
  }

  async findOne(id: number) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['projectUsers', 'projectResources', 'customer', 'user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      ...project,
      customerName: project.customer
        ? `${project.customer.firstName} ${project.customer.lastName}`
        : 'Unknown Customer',
      projectUsers: project.projectUsers,
      projectResources: project.projectResources,
    };
  }

  async create(userId: number, createProjectDto: CreateProjectDto) {
    const { users, resources, customerId, ...projectData } = createProjectDto;

    // Fetch the user's associated startups
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cfoStartups'],
    });

    if (!user || user.cfoStartups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    // Assume the user is assigned to only one startup
    const assignedStartup = user.cfoStartups[0];

    // Create the project
    const project = this.projectRepository.create({
      ...projectData,
      user: { id: userId }, // Changed to use id instead of full user object
      customer: { id: customerId },
      startup: { id: assignedStartup.id }, // Changed to use id instead of full startup object
    });

    // Save the project first to get an id
    const savedProject = await this.projectRepository.save(project);

    // Create associated users and resources
    if (users && users.length > 0) {
      const projectUsers = users.map((user) =>
        this.projectUserRepository.create({
          userName: user.userName,
          userEmail: user.userEmail,
          project: { id: savedProject.id },
        }),
      );
      await this.projectUserRepository.save(projectUsers);
    }

    if (resources && resources.length > 0) {
      const projectResources = resources.map((resource) =>
        this.projectResourceRepository.create({
          resourceCategory: resource.resourceCategory,
          subCategory: resource.subCategory,
          expense: resource.expense,
          project: { id: savedProject.id },
        }),
      );
      await this.projectResourceRepository.save(projectResources);
    }

    // Fetch the complete project with all relations
    return this.projectRepository.findOne({
      where: { id: savedProject.id },
      relations: [
        'projectUsers',
        'projectResources',
        'customer',
        'user',
        'startup',
      ],
    });
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const { users, resources, ...projectData } = updateProjectDto;

    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    // Update project fields
    await this.projectRepository.update(id, projectData);

    // Update associated users and resources
    await this.projectUserRepository.delete({ project: { id } });
    await this.projectResourceRepository.delete({ project: { id } });

    const projectUsers = users.map((user) =>
      this.projectUserRepository.create({
        userName: user.userName,
        userEmail: user.userEmail,
        project,
      }),
    );
    const projectResources = resources.map((resource) =>
      this.projectResourceRepository.create({
        resourceCategory: resource.resourceCategory,
        subCategory: resource.subCategory,
        expense: resource.expense,
        project,
      }),
    );

    project.projectUsers = projectUsers;
    project.projectResources = projectResources;

    return this.projectRepository.save(project);
  }

  async remove(id: number) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }
    return this.projectRepository.remove(project);
  }

  async findAllByCeo(ceoId: number) {
    const startups = await this.startupRepository.find({
      where: { ceo: { id: ceoId } },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    const projects = await this.projectRepository.find({
      where: { startup: { id: In(startupIds) } },
      relations: ['user'],
    });

    return projects.map((project) => ({
      id: project.id,
      userId: project.user.id,
      userName: `${project.user.firstName} ${project.user.lastName}`,
      userEmail: project.user.email,
      amount: project.totalExpenses,
      createdAt: project.createdAt,
      type: 'project',
    }));
  }

  async findAllByCfo(cfoId: number) {
    return this.projectRepository.find({
      where: { user: { id: cfoId } },
      relations: ['customer'],
    });
  }

  async findAllByStartup(startupId: number) {
    return this.projectRepository.find({
      where: { startup: { id: startupId } },
      relations: ['projectUsers', 'projectResources', 'customer', 'user'],
    });
  }
}
