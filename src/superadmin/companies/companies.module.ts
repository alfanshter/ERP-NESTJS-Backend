import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CompanyUsersModule } from './users/company-users.module';

@Module({
  imports: [PrismaModule, CompanyUsersModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
