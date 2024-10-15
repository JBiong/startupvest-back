import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePaymentDto } from 'src/dto/PaymentDto/create-payment.dto';
import { UpdatePaymentDto } from 'src/dto/PaymentDto/update-payment.dto';
import { Payment } from 'src/entities/PaymentEntity/payment.entity';
import { InvoiceService } from '../InvoiceService/invoice.service';
import { Invoice } from 'src/entities/InvoiceEntity/invoice.entity';
import { find, map } from 'rxjs';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>, // Correct injection for InvoiceRepository

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Correct injection for UserRepository

    private readonly invoiceService: InvoiceService, // Inject the InvoiceService
  ) {}

  findAll() {
    return this.paymentRepository.find({
      relations: ['customer', 'paymentItems', 'startup', 'user'],
    });
  }

  findOne(id: number) {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ['customer', 'paymentItems', 'startup', 'user'],
    });
  }

  async findAllByStartup(startupId: number) {
    const payments = await this.paymentRepository.find({
      where: { startup: { id: startupId } },
      relations: ['paymentItems', 'user'], // Include 'user' relation
    });

    // Map the payments to include user information
    return payments.map((payment) => ({
      ...payment,
      userName: `${payment.user.firstName} ${payment.user.lastName}`,
      userEmail: payment.user.email,
    }));
  }

  async create(userId: number, createPaymentDto: CreatePaymentDto) {
    const {
      customerId,
      dateOfPayment,
      paymentNumber,
      modeOfPayment,
      referenceNumber,
      totalAmount,
      payments,
    } = createPaymentDto;

    // Fetch the user's associated startups
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cfoStartups'],
    });

    if (!user || user.cfoStartups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    const assignedStartupId = user.cfoStartups[0].id;

    const payment = this.paymentRepository.create({
      user: { id: userId }, // Reference the user
      customer: { id: customerId }, // Reference the customer
      startup: { id: assignedStartupId }, // Reference the startup
      dateOfPayment,
      paymentNumber,
      modeOfPayment,
      referenceNumber,
      totalAmount,
      paymentItems: payments.map((payment) => ({
        amount: payment.amount,
        invoice: { id: payment.invoiceId }, // Reference the invoice
      })),
    });

    const createdPayment = await this.paymentRepository.save(payment);

    // Update invoice balance and status after creating the payment
    for (const paymentItem of payments) {
      await this.updateInvoiceBalance(
        paymentItem.invoiceId,
        paymentItem.amount,
      );
    }

    return createdPayment;
  }

  private async updateInvoiceBalance(invoiceId: number, paymentAmount: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${invoiceId} not found`);
    }

    // Subtract the payment amount from the current balance
    invoice.balanceDue = invoice.balanceDue - paymentAmount;

    // Update the status if balance is fully paid
    if (invoice.balanceDue <= 0) {
      invoice.status = 'paid';
      invoice.balanceDue = 0; // Ensure balance doesn't go negative
    }

    await this.invoiceRepository.save(invoice); // Save updated invoice
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const {
      customerId,
      dateOfPayment,
      modeOfPayment,
      referenceNumber,
      paymentNumber,
      payments,
    } = updatePaymentDto;

    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['paymentItems'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    const updatedPayment = this.paymentRepository.create({
      ...payment,
      customer: { id: customerId },
      dateOfPayment,
      modeOfPayment,
      referenceNumber,
      paymentNumber,
      totalAmount: payments.reduce((sum, item) => sum + item.amount, 0),
      paymentItems: payments.map((item) => ({
        amount: item.amount,
        invoice: { id: item.invoiceId },
      })),
    });

    return this.paymentRepository.save(updatedPayment);
  }

  remove(id: number) {
    return this.paymentRepository.delete(id);
  }

  async findAllByCeo(ceoId: number) {
    const startups = await this.paymentRepository.manager.find(Startup, {
      where: { ceo: { id: ceoId } },
      relations: ['payments'],
    });

    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    const payments = await this.paymentRepository.find({
      where: {
        startup: { id: In(startupIds) },
      },
      relations: ['paymentItems', 'user'], // Include the user relation
    });

    // Map the payments to include user information
    return payments.map((payment) => ({
      ...payment,
      userName: `${payment.user.firstName} ${payment.user.lastName}`,
      userEmail: payment.user.email,
    }));
  }

  async findAllByCfo(cfoId: number) {
    return this.paymentRepository.find({
      where: { user: { id: cfoId } },
      relations: ['customer'],
    });
  }
}
