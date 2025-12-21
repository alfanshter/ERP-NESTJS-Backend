import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  LIFETIME = 'LIFETIME',
}

export class CreatePricingPlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;

  @IsArray()
  features: string[];

  @IsNumber()
  @Min(1)
  maxUsers: number;

  @IsNumber()
  @Min(1)
  maxProjects: number;

  @IsNumber()
  @Min(1)
  maxStorage: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
