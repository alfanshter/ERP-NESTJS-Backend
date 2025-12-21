import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';

@Injectable()
export class PricingPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPricingPlanDto: CreatePricingPlanDto) {
    return this.prisma.pricingPlan.create({
      data: createPricingPlanDto,
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.pricingPlan.findMany({
      where,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: { price: 'asc' },
    });
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

    return plan;
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
}
