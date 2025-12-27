import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUrl,
  IsNumber,
  ValidateIf,
  MinLength,
} from 'class-validator';

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
  email: string; // Required - will be used as admin email

  @IsString()
  @IsOptional()
  phone?: string;

  // Admin user fields (created automatically with company)
  @IsString()
  @MinLength(8)
  @IsOptional()
  adminPassword?: string; // Optional - auto-generated if not provided

  @IsString()
  @IsOptional()
  adminFirstName?: string; // Optional - admin's first name

  @IsString()
  @IsOptional()
  adminLastName?: string; // Optional - admin's last name

  // Location - using Region ID from autocomplete
  @IsString()
  @IsOptional()
  regionId?: string; // Region ID from autocomplete (e.g., "35.14.18.2007" for Wonosari, Gondangwetan, Pasuruan)

  @IsString()
  @IsOptional()
  address?: string; // Alamat detail (jalan, nomor, RT/RW)

  @IsString()
  @IsOptional()
  postalCode?: string; // Kode pos (optional, can override region's postal code)

  @IsNumber()
  @IsOptional()
  latitude?: number; // Koordinat latitude (optional override)

  @IsNumber()
  @IsOptional()
  longitude?: number; // Koordinat longitude (optional override)

  // Company info
  @ValidateIf((o) => o.logo !== undefined && o.logo !== null && o.logo !== '')
  @IsUrl()
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
