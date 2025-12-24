import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate final price after discount
   */
  private calculatePrice(
    plan: any,
    billingPeriod: 'MONTHLY' | 'YEARLY',
  ): number {
    const isMonthly = billingPeriod === 'MONTHLY';
    const originalPrice = isMonthly ? plan.monthlyPrice : plan.yearlyPrice;
    const discount = isMonthly ? plan.monthlyDiscount : plan.yearlyDiscount;
    const discountType = plan.discountType;

    if (!discount || discount === 0) {
      return originalPrice;
    }

    if (discountType === 'PERCENTAGE') {
      const discountAmount = (originalPrice * discount) / 100;
      return Math.max(0, originalPrice - discountAmount);
    } else {
      // FIXED
      return Math.max(0, originalPrice - discount);
    }
  }

  /**
   * Calculate next billing date
   */
  private calculateNextBillingDate(
    startDate: Date,
    billingPeriod: 'MONTHLY' | 'YEARLY' | 'LIFETIME',
  ): Date {
    const nextDate = new Date(startDate);

    if (billingPeriod === 'MONTHLY') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (billingPeriod === 'YEARLY') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      // LIFETIME - set to 100 years from start date
      nextDate.setFullYear(nextDate.getFullYear() + 100);
    }

    return nextDate;
  }

  async create(createDto: CreateSubscriptionDto) {
    // Check if plan exists
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { id: createDto.planId },
    });

    if (!plan) {
      throw new NotFoundException(
        `Pricing plan with ID ${createDto.planId} not found`,
      );
    }

    if (!plan.isActive) {
      throw new BadRequestException('This pricing plan is not active');
    }

    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: createDto.companyId },
    });

    if (!company) {
      throw new NotFoundException(
        `Company with ID ${createDto.companyId} not found`,
      );
    }

    // Check if company already has active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        company: {
          id: createDto.companyId,
        },
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
    });

    if (existingSubscription) {
      throw new ConflictException(
        'Company already has an active subscription. Please cancel the current subscription first.',
      );
    }

    // Calculate price based on billing period and discount
    const finalPrice = this.calculatePrice(plan, createDto.billingPeriod);

    const startDate = createDto.startDate
      ? new Date(createDto.startDate)
      : new Date();

    const nextBillingDate = this.calculateNextBillingDate(
      startDate,
      createDto.billingPeriod,
    );

    // Calculate end date (subscription expiry)
    // endDate is when subscription expires (same as nextBillingDate)
    const endDate = this.calculateNextBillingDate(
      startDate,
      createDto.billingPeriod,
    );

    // Create subscription with PENDING status (waiting for payment)
    const subscription = await this.prisma.subscription.create({
      data: {
        planId: createDto.planId,
        billingPeriod: createDto.billingPeriod,
        price: finalPrice,
        autoRenew: createDto.autoRenew ?? true,
        startDate,
        endDate,
        nextBillingAt: nextBillingDate,
        status: 'PENDING', // Will be activated after payment
      },
      include: {
        plan: true,
      },
    });

    // Update company's subscriptionId
    await this.prisma.company.update({
      where: { id: createDto.companyId },
      data: { subscriptionId: subscription.id },
    });

    return subscription;
  }

  async findAll(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          plan: true,
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findByCompanyId(companyId: string) {
    // First, verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        subscriptionId: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Find subscription linked to this company
    if (!company.subscriptionId) {
      return {
        company,
        subscription: null,
        message: 'Company does not have an active subscription',
      };
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: company.subscriptionId },
      include: {
        plan: true,
      },
    });

    return {
      company,
      subscription,
    };
  }

  async update(id: string, updateDto: UpdateSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        planId: true,
        billingPeriod: true,
        startDate: true,
        status: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    const updateData: any = {};

    // If changing billing period, recalculate price, endDate, and nextBillingAt
    if (
      updateDto.billingPeriod &&
      updateDto.billingPeriod !== existing.billingPeriod
    ) {
      const plan = await this.prisma.pricingPlan.findUnique({
        where: { id: existing.planId },
      });

      if (plan) {
        updateData.billingPeriod = updateDto.billingPeriod;
        updateData.price = this.calculatePrice(plan, updateDto.billingPeriod);

        // Recalculate next billing date and end date
        const startDate = updateDto.startDate
          ? new Date(updateDto.startDate)
          : existing.startDate;
        const newEndDate = this.calculateNextBillingDate(
          startDate,
          updateDto.billingPeriod,
        );
        updateData.endDate = newEndDate;
        updateData.nextBillingAt = newEndDate;
      }
    }

    // If only changing startDate without billingPeriod change
    if (updateDto.startDate && !updateDto.billingPeriod) {
      const startDate = new Date(updateDto.startDate);
      updateData.startDate = startDate;
      // Recalculate endDate based on existing billingPeriod
      const newEndDate = this.calculateNextBillingDate(
        startDate,
        existing.billingPeriod,
      );
      updateData.endDate = newEndDate;
      updateData.nextBillingAt = newEndDate;
    }

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }

    if (updateDto.autoRenew !== undefined) {
      updateData.autoRenew = updateDto.autoRenew;
    }

    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        plan: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async cancel(id: string) {
    const subscription = await this.findOne(id);

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
        endDate: new Date(),
      },
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
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Remove subscription reference from company first
    await this.prisma.company.updateMany({
      where: { subscriptionId: id },
      data: { subscriptionId: null },
    });

    await this.prisma.subscription.delete({
      where: { id },
    });

    return { message: 'Subscription deleted successfully' };
  }
}
