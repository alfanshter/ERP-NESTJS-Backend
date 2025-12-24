import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';

@Injectable()
export class PricingPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPricingPlanDto: CreatePricingPlanDto) {
    const data = {
      ...createPricingPlanDto,
      discountType:
        (createPricingPlanDto.discountType as 'PERCENTAGE' | 'FIXED') ||
        'PERCENTAGE',
      monthlyDiscount: createPricingPlanDto.monthlyDiscount || 0,
      yearlyDiscount: createPricingPlanDto.yearlyDiscount || 0,
    };

    return this.prisma.pricingPlan.create({
      data,
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    const plans = await this.prisma.pricingPlan.findMany({
      where,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: { monthlyPrice: 'asc' },
    });

    // Add calculated final prices after discount
    return plans.map((plan) => ({
      ...plan,
      finalMonthlyPrice: this.calculateFinalPrice(
        plan.monthlyPrice,
        plan.monthlyDiscount || 0,
        plan.discountType,
      ),
      finalYearlyPrice: this.calculateFinalPrice(
        plan.yearlyPrice,
        plan.yearlyDiscount || 0,
        plan.discountType,
      ),
    }));
  }

  async findOne(id: string) {
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Pricing plan with ID ${id} not found`);
    }

    // Add calculated final prices
    return {
      ...plan,
      finalMonthlyPrice: this.calculateFinalPrice(
        plan.monthlyPrice,
        plan.monthlyDiscount || 0,
        plan.discountType,
      ),
      finalYearlyPrice: this.calculateFinalPrice(
        plan.yearlyPrice,
        plan.yearlyDiscount || 0,
        plan.discountType,
      ),
    };
  }

  async update(id: string, updatePricingPlanDto: UpdatePricingPlanDto) {
    await this.findOne(id);

    return this.prisma.pricingPlan.update({
      where: { id },
      data: updatePricingPlanDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if plan has active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new Error(
        `Cannot delete plan with ${activeSubscriptions} active subscriptions`,
      );
    }

    return this.prisma.pricingPlan.delete({
      where: { id },
    });
  }

  /**
   * Calculate final price after discount
   * @param originalPrice - Original price
   * @param discount - Discount value (percentage 0-100 or fixed amount)
   * @param discountType - PERCENTAGE or FIXED
   */
  private calculateFinalPrice(
    originalPrice: number,
    discount: number,
    discountType: string,
  ): number {
    if (!discount || discount === 0) {
      return originalPrice;
    }

    if (discountType === 'PERCENTAGE') {
      // Diskon persentase (0-100)
      const discountAmount = (originalPrice * discount) / 100;
      return Math.max(0, originalPrice - discountAmount);
    } else {
      // Diskon nominal tetap
      return Math.max(0, originalPrice - discount);
    }
  }
}
