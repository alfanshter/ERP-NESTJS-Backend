import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create payment for subscription
   * Status: PENDING (menunggu pembayaran)
   */
  async createPayment(createDto: CreatePaymentDto) {
    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: createDto.subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription with ID ${createDto.subscriptionId} not found`,
      );
    }

    // Create payment with PENDING status
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: createDto.subscriptionId,
        amount: createDto.amount,
        paymentMethod: createDto.paymentMethod,
        paymentGateway: createDto.paymentGateway,
        paymentProof: createDto.paymentProof,
        notes: createDto.notes,
        status: 'PENDING',
        // Set expiry 24 hours from now
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        subscription: {
          include: {
            plan: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return payment;
  }

  /**
   * Mock payment success (simulasi payment gateway)
   * Untuk development sebelum integrasi payment gateway
   */
  async mockPaymentSuccess(paymentId: string, processDto?: ProcessPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Payment already processed with status: ${payment.status}`,
      );
    }

    // Update payment to SUCCESS
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        transactionId:
          processDto?.transactionId || `MOCK-TRX-${Date.now()}`,
        paymentProof: processDto?.paymentProof,
        notes: processDto?.notes || payment.notes,
      },
    });

    // Activate subscription
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
        lastPaymentAt: new Date(),
      },
    });

    return updatedPayment;
  }

  /**
   * Get all payments with filters
   */
  async findAll(
    page = 1,
    limit = 10,
    status?: string,
    subscriptionId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (subscriptionId) {
      where.subscriptionId = subscriptionId;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: {
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  monthlyPrice: true,
                  yearlyPrice: true,
                },
              },
              company: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payment by ID
   */
  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            plan: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Get payments by subscription ID
   */
  async findBySubscription(subscriptionId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  /**
   * Cancel payment
   */
  async cancel(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot cancel payment with status: ${payment.status}`,
      );
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }
}
