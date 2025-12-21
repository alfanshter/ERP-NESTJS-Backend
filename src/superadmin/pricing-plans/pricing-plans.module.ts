import { Module } from '@nestjs/common';
import { PricingPlansService } from './pricing-plans.service';
import { PricingPlansController } from './pricing-plans.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PricingPlansController],
  providers: [PricingPlansService],
  exports: [PricingPlansService],
})
export class PricingPlansModule {}
