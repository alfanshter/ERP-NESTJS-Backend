import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('superadmin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('company-growth')
  getCompanyGrowth(
    @Query('months', new DefaultValuePipe(12), ParseIntPipe) months: number,
  ) {
    return this.dashboardService.getCompanyGrowth(months);
  }

  @Get('subscription-breakdown')
  getSubscriptionBreakdown() {
    return this.dashboardService.getSubscriptionBreakdown();
  }

  @Get('company-status')
  getCompanyStatusDistribution() {
    return this.dashboardService.getCompanyStatusDistribution();
  }
}
