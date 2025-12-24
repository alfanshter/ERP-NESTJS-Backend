import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE', // Diskon dalam persen (0-100)
  FIXED = 'FIXED', // Diskon nominal tetap
}

export class CreatePricingPlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @IsNumber()
  @Min(0)
  yearlyPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyDiscount?: number; // Diskon untuk monthly

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyDiscount?: number; // Diskon untuk yearly

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType; // PERCENTAGE atau FIXED (default: PERCENTAGE)

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
