import {
  IsEnum,
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateSubscriptionDto {
  @IsString()
  planId: string;

  @IsString()
  companyId: string;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: string;
}
