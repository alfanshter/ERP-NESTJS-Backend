import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  INACTIVE = 'INACTIVE',
}

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
