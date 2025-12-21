import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { PricingPlansModule } from './pricing-plans/pricing-plans.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [CompaniesModule, PricingPlansModule, DashboardModule],
})
export class SuperadminModule {}
