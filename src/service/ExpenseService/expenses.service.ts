import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExpensesDto } from 'src/dto/ExpenseDto/create-expenses.dto';
import { UpdateExpensesDto } from 'src/dto/ExpenseDto/update-expenses.dto';
import { Expenses } from 'src/entities/ExpenseEntity/expenses.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expenses)
    private readonly expensesRepository: Repository<Expenses>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
  ) {}

  findAll() {
    return this.expensesRepository.find({
      relations: ['category', 'user', 'startup'],
    });
  }

  findOne(id: number) {
    return this.expensesRepository.findOne({
      where: { id },
      relations: ['category', 'user', 'startup'],
    });
  }

  async create(userId: number, createExpensesDto: CreateExpensesDto) {
    // Fetch the user's associated startups
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cfoStartups'],
    });

    if (!user || user.cfoStartups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    const assignedStartupId = user.cfoStartups[0].id;

    const expense = this.expensesRepository.create({
      ...createExpensesDto,
      user: { id: userId }, // Set user directly by ID
      startup: { id: assignedStartupId }, // Set startup directly by ID
      category: { id: createExpensesDto.categoryId }, // Use 'categories' instead of 'category'
    });

    return this.expensesRepository.save(expense);
  }

  async update(id: number, updateExpensesDto: UpdateExpensesDto) {
    const expense = await this.expensesRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.expensesRepository.update(id, updateExpensesDto);
    return this.expensesRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const expense = await this.expensesRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.expensesRepository.remove(expense);
  }

  async findAllByCeo(ceoId: number) {
    const startups = await this.startupRepository.find({
      where: { ceo: { id: ceoId } },
    });
    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    const expenses = await this.expensesRepository.find({
      where: { startup: { id: In(startupIds) } },
      relations: ['category', 'user'],
    });

    return expenses.map((expense) => ({
      id: expense.id,
      userId: expense.user.id,
      userName: `${expense.user.firstName} ${expense.user.lastName}`,
      userEmail: expense.user.email,
      amount: expense.amount,
      createdAt: expense.createdAt,
      type: 'expense',
    }));
  }

  async findAllByCfo(cfoId: number) {
    return this.expensesRepository.find({
      where: { user: { id: cfoId } },
      relations: ['category'],
    });
  }

  async findAllByStartup(startupId: number) {
    return this.expensesRepository.find({
      where: { startup: { id: startupId } },
      relations: ['category', 'user'],
    });
  }
}
