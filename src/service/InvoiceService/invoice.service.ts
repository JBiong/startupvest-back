import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from 'src/dto/InvoiceDto/create-invoice.dto';
import { UpdateInvoiceDto } from 'src/dto/InvoiceDto/update-invoice.dto';
import { Invoice } from 'src/entities/InvoiceEntity/invoice.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.invoiceRepository.find({
      relations: ['customer', 'items', 'paymentItems', 'startup', 'user'],
    });
  }

  findOne(id: number) {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'paymentItems', 'startup', 'user'],
    });
  }

  async create(userId: number, createInvoiceDto: CreateInvoiceDto) {
    const { items, customerId, ...invoiceData } = createInvoiceDto; // Extract customerId from DTO

    const total = items.reduce((acc, item) => acc + item.amount, 0);

    // Fetch the user's associated startups
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cfoStartups'],
    });

    if (!user || user.cfoStartups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    const assignedStartupId = user.cfoStartups[0].id;

    // Create the invoice using the customerId from DTO
    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      total,
      balanceDue: total,
      status: 'pending',
      startup: { id: assignedStartupId },
      user: { id: userId },
      customer: { id: customerId }, // Associate the customer
      items: items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
      })),
    });

    return this.invoiceRepository.save(invoice);
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    const { items, ...invoiceData } = updateInvoiceDto;
    const total = items ? items.reduce((acc, item) => acc + item.amount, 0) : 0;

    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.invoiceRepository.save({
      ...invoice,
      ...invoiceData,
      total,
      items: items
        ? items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
          }))
        : undefined,
    });

    return this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async remove(id: number) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return this.invoiceRepository.remove(invoice);
  }

  async findByCustomerId(customerId: number) {
    return this.invoiceRepository.find({
      where: { customer: { id: customerId } },
      relations: ['items', 'paymentItems'],
    });
  }

  async updateStatus(id: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['paymentItems'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    const totalPaid = invoice.paymentItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const balanceDue = invoice.total - totalPaid;

    let status = 'pending';
    if (balanceDue <= 0) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partially paid';
    } else if (new Date(invoice.dueDate) < new Date()) {
      status = 'overdue';
    }

    return this.invoiceRepository.save({
      ...invoice,
      status,
      balanceDue,
    });
  }

  async findAllByCfo(cfoId: number) {
    return this.invoiceRepository.find({
      where: { user: { id: cfoId } },
      relations: ['customer'],
    });
  }
  
}
