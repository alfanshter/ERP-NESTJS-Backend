import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalPlans,
      activeSubscriptions,
      recentCompanies,
      revenueSummary,
    ] = await Promise.all([
      // Total companies
      this.prisma.company.count(),

      // Active companies
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),

      // Total users
      this.prisma.user.count(),

      // Total pricing plans
      this.prisma.pricingPlan.count({ where: { isActive: true } }),

      // Active subscriptions
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),

      // Recent companies (last 5)
      this.prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),

      // Revenue calculation (approximate based on active subscriptions)
      this.getRevenueSummary(),
    ]);

    return {
      stats: {
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalPlans,
        activeSubscriptions,
      },
      recentCompanies,
      revenue: revenueSummary,
    };
  }

  private async getRevenueSummary() {
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        plan: true,
      },
    });

    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
      if (sub.billingPeriod === 'MONTHLY') {
        return sum + sub.price;
      } else if (sub.billingPeriod === 'YEARLY') {
        return sum + sub.price / 12; // Convert yearly to monthly
      }
      return sum;
    }, 0);

    const yearlyRevenue = monthlyRevenue * 12;

    return {
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
      activeSubscriptions: activeSubscriptions.length,
    };
  }

  async getCompanyGrowth(months = 12) {
    const data: { month: string; count: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await this.prisma.company.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      data.push({
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        count,
      });
    }

    return data;
  }

  async getSubscriptionBreakdown() {
    const plans = await this.prisma.pricingPlan.findMany({
      where: { isActive: true },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    return plans.map((plan) => {
      const monthlyRevenue = plan.subscriptions.reduce((sum, sub) => {
        if (sub.billingPeriod === 'MONTHLY') {
          return sum + sub.price;
        } else if (sub.billingPeriod === 'YEARLY') {
          return sum + sub.price / 12; // Convert to monthly
        }
        return sum;
      }, 0);

      return {
        planName: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        subscriptions: plan.subscriptions.length,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        annualRevenue: Math.round(monthlyRevenue * 12 * 100) / 100,
      };
    });
  }

  async getCompanyStatusDistribution() {
    const [active, trial, suspended, inactive] = await Promise.all([
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.count({ where: { status: 'TRIAL' } }),
      this.prisma.company.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.company.count({ where: { status: 'INACTIVE' } }),
    ]);

    return [
      { status: 'Active', count: active },
      { status: 'Trial', count: trial },
      { status: 'Suspended', count: suspended },
      { status: 'Inactive', count: inactive },
    ];
  }
}
