import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateBudgetProposalDto } from 'src/dto/BudgetProposalDto/create-budget-proposal.dto';
import {
  UpdateBudgetProposalDto,
  UpdateBudgetProposalStatusDto,
} from 'src/dto/BudgetProposalDto/update-budget-proposal.dto';
import { BudgetProposal } from 'src/entities/BudgetProposalEntity/budget-proposal.entity';
import { BudgetBreakdown } from 'src/entities/BudgetProposalEntity/budget-breakdown.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Injectable()
export class BudgetProposalService {
  constructor(
    @InjectRepository(BudgetProposal)
    private budgetProposalRepository: Repository<BudgetProposal>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Startup) private startupRepository: Repository<Startup>,
    @InjectRepository(BudgetBreakdown)
    private budgetBreakdownRepository: Repository<BudgetBreakdown>, // Injecting BudgetBreakdown
  ) {}

  async findAll() {
    return this.budgetProposalRepository.find({
      relations: ['budgetBreakdown'],
    });
  }

  async findOne(id: number) {
    const budgetProposal = await this.budgetProposalRepository.findOne({
      where: { id },
      relations: ['budgetBreakdown'],
    });
    if (!budgetProposal) {
      throw new NotFoundException('Budget Proposal not found');
    }
    return budgetProposal;
  }

  async findAllByCeo(ceoId: number) {
    // Fetch all startups created by the CEO
    const startups = await this.startupRepository.find({
      where: { ceo: { id: ceoId } },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No Budget Proposal found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    // Fetch all budget proposals related to these startups
    return this.budgetProposalRepository.find({
      where: { startup: { id: In(startupIds) } },
      relations: ['budgetBreakdown'],
    });
  }

  async create(
    userId: number,
    createBudgetProposalDto: CreateBudgetProposalDto,
  ) {
    const { budgetBreakdowns, ...budgetProposalData } = createBudgetProposalDto;

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

    const budgetProposal = this.budgetProposalRepository.create({
      ...budgetProposalData,
      user,
      startup: assignedStartup,
      budgetBreakdown: budgetBreakdowns.map((breakdown) =>
        this.budgetBreakdownRepository.create({
          proposalCategory: breakdown.proposalCategory,
          allocatedAmount: breakdown.allocatedAmount,
          description: breakdown.description,
        }),
      ),
    });

    return this.budgetProposalRepository.save(budgetProposal);
  }

  async update(id: number, updateBudgetProposal: UpdateBudgetProposalDto) {
    const { budgetBreakdowns, ...budgetProposalData } = updateBudgetProposal;

    const budgetProposal = await this.budgetProposalRepository.findOne({
      where: { id },
    });
    if (!budgetProposal) {
      throw new NotFoundException(`Budget Proposal with ID ${id} not found.`);
    }

    // Update project fields
    await this.budgetProposalRepository.update(id, budgetProposalData);

    // Update associated breakdowns
    await this.budgetBreakdownRepository.delete({ budgetProposal: { id } });

    const newBreakdowns = budgetBreakdowns?.map((breakdown) =>
      this.budgetBreakdownRepository.create({
        proposalCategory: breakdown.proposalCategory,
        allocatedAmount: breakdown.allocatedAmount,
        description: breakdown.description,
        budgetProposal,
      }),
    );

    await this.budgetBreakdownRepository.save(newBreakdowns);

    return this.budgetProposalRepository.findOne({
      where: { id },
      relations: ['budgetBreakdown'],
    });
  }

  async updateStatus(
    id: number,
    updateBudgetProposalStatusDto: UpdateBudgetProposalStatusDto,
  ) {
    const budgetProposal = await this.budgetProposalRepository.findOne({
      where: { id },
    });
    if (!budgetProposal) {
      throw new NotFoundException(`Budget Proposal with ID ${id} not found.`);
    }

    budgetProposal.status = updateBudgetProposalStatusDto.status;
    budgetProposal.ceoComment = updateBudgetProposalStatusDto.ceoComment;

    return this.budgetProposalRepository.save(budgetProposal);
  }

  async remove(id: number) {
    const budgetProposal = await this.budgetProposalRepository.findOne({
      where: { id },
    });
    if (!budgetProposal) {
      throw new NotFoundException(`Budget Proposal with ID ${id} not found.`);
    }
    return this.budgetProposalRepository.remove(budgetProposal);
  }

  async findAllByCfo(cfoId: number) {
    return this.budgetProposalRepository.find({
      where: { user: { id: cfoId } },
    });
  }
}
