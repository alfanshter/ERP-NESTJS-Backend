import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Create a new user that belongs to a specific company.
 *
 * Notes:
 * - password is optional; if omitted service will set default password "admin123".
 * - roleName is required and must reference an existing Role.
 */
export class CreateCompanyUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  roleName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
