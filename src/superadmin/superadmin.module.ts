import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { PricingPlansModule } from './pricing-plans/pricing-plans.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [CompaniesModule, PricingPlansModule, DashboardModule, StaffModule],
})
export class SuperadminModule {}
