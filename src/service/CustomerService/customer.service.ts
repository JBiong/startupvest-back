import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateCustomerDto } from 'src/dto/CustomerDto/create-customer.dto';
import { UpdateCustomerDto } from 'src/dto/CustomerDto/update-customer.dto';
import { Customer } from 'src/entities/CustomerEntity/customer.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';


@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
  ) {}

  findAll() {
    return this.customerRepository.find();
  }

  findOne(id: number) {
    return this.customerRepository.findOne({ where: { id } });
  }

  async findAllByStartup(startupId: number) {
    return this.customerRepository.find({
      where: { startup: { id: startupId } },
    });
  }

  async create(userId: number, createCustomerDto: CreateCustomerDto) {
    // Fetch the user along with their associated startups
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cfoStartups'],
    });
   
    if (!user || user.cfoStartups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    const assignedStartup = user.cfoStartups[0];
    const newCustomer = this.customerRepository.create({
      ...createCustomerDto,
      user,
      startup: assignedStartup,
    });

    return this.customerRepository.save(newCustomer);
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.update(id, updateCustomerDto);

    return this.customerRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.remove(customer);

    return { message: 'Customer deleted successfully' };
  }

  async findAllByCeo(ceoId: number) {
    // Fetch all startups created by the CEO
    const startups = await this.startupRepository.find({
      where: { ceo: { id: ceoId } },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    // Fetch all customers related to these startups
    return this.customerRepository.find({
      where: { startup: { id: In(startupIds) } },
    });
  }

  async findAllByCfo(cfoId: number) {
    return this.customerRepository.find({
      where: { user: { id: cfoId } },
    });
  }
}
